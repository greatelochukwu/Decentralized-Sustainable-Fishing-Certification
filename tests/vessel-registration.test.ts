import { describe, it, expect, beforeEach } from 'vitest';

// Mock implementation for testing Clarity contracts
const mockBlockchain = {
  currentSender: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  blockHeight: 100,
  vessels: new Map(),
  nextVesselId: 1,
  
  reset() {
    this.vessels.clear();
    this.nextVesselId = 1;
    this.blockHeight = 100;
  }
};

// Mock implementation of vessel-registration contract functions
function registerVessel(name, vesselType) {
  const vesselId = mockBlockchain.nextVesselId;
  
  mockBlockchain.vessels.set(vesselId, {
    name,
    owner: mockBlockchain.currentSender,
    vesselType,
    registrationDate: mockBlockchain.blockHeight,
    isActive: true
  });
  
  mockBlockchain.nextVesselId++;
  return { ok: vesselId };
}

function updateVesselStatus(vesselId, isActive) {
  if (!mockBlockchain.vessels.has(vesselId)) {
    return { err: 1 };
  }
  
  const vessel = mockBlockchain.vessels.get(vesselId);
  if (vessel.owner !== mockBlockchain.currentSender) {
    return { err: 2 };
  }
  
  vessel.isActive = isActive;
  mockBlockchain.vessels.set(vesselId, vessel);
  return { ok: true };
}

function getVessel(vesselId) {
  return mockBlockchain.vessels.get(vesselId) || null;
}

function isVesselOwner(vesselId, owner) {
  if (!mockBlockchain.vessels.has(vesselId)) {
    return { err: false };
  }
  
  const vessel = mockBlockchain.vessels.get(vesselId);
  return { ok: vessel.owner === owner };
}

describe('Vessel Registration Contract', () => {
  beforeEach(() => {
    mockBlockchain.reset();
  });
  
  it('should register a new vessel', () => {
    const result = registerVessel('Fishing Boat 1', 'Trawler');
    
    expect(result).toEqual({ ok: 1 });
    expect(mockBlockchain.vessels.size).toBe(1);
    expect(mockBlockchain.vessels.get(1)).toEqual({
      name: 'Fishing Boat 1',
      owner: mockBlockchain.currentSender,
      vesselType: 'Trawler',
      registrationDate: 100,
      isActive: true
    });
  });
  
  it('should update vessel status', () => {
    registerVessel('Fishing Boat 1', 'Trawler');
    const result = updateVesselStatus(1, false);
    
    expect(result).toEqual({ ok: true });
    expect(mockBlockchain.vessels.get(1).isActive).toBe(false);
  });
  
  it('should fail to update vessel status if not owner', () => {
    registerVessel('Fishing Boat 1', 'Trawler');
    
    // Change sender
    const originalSender = mockBlockchain.currentSender;
    mockBlockchain.currentSender = 'ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    
    const result = updateVesselStatus(1, false);
    expect(result).toEqual({ err: 2 });
    
    // Restore sender
    mockBlockchain.currentSender = originalSender;
  });
  
  it('should check if principal is vessel owner', () => {
    registerVessel('Fishing Boat 1', 'Trawler');
    
    const result = isVesselOwner(1, mockBlockchain.currentSender);
    expect(result).toEqual({ ok: true });
    
    const wrongOwnerResult = isVesselOwner(1, 'ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM');
    expect(wrongOwnerResult).toEqual({ ok: false });
  });
});
