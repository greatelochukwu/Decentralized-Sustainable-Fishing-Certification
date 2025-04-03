;; Vessel Registration Contract
;; Records details of fishing boats and equipment

(define-data-var next-vessel-id uint u1)

(define-map vessels
  { vessel-id: uint }
  {
    name: (string-utf8 100),
    owner: principal,
    vessel-type: (string-utf8 50),
    registration-date: uint,
    is-active: bool
  }
)

(define-public (register-vessel (name (string-utf8 100)) (vessel-type (string-utf8 50)))
  (let
    (
      (vessel-id (var-get next-vessel-id))
    )
    (map-set vessels
      { vessel-id: vessel-id }
      {
        name: name,
        owner: tx-sender,
        vessel-type: vessel-type,
        registration-date: block-height,
        is-active: true
      }
    )
    (var-set next-vessel-id (+ vessel-id u1))
    (ok vessel-id)
  )
)

(define-public (update-vessel-status (vessel-id uint) (is-active bool))
  (let
    (
      (vessel (unwrap! (map-get? vessels { vessel-id: vessel-id }) (err u1)))
    )
    (asserts! (is-eq tx-sender (get owner vessel)) (err u2))
    (map-set vessels
      { vessel-id: vessel-id }
      (merge vessel { is-active: is-active })
    )
    (ok true)
  )
)

(define-read-only (get-vessel (vessel-id uint))
  (map-get? vessels { vessel-id: vessel-id })
)

(define-read-only (is-vessel-owner (vessel-id uint) (owner principal))
  (let
    (
      (vessel (unwrap! (map-get? vessels { vessel-id: vessel-id }) (err false)))
    )
    (ok (is-eq owner (get owner vessel)))
  )
)
