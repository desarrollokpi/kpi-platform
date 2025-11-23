exports.READ_INVOICES_BY_CONTRACT = `
select invoice.id,
       invoice_id    as invoiceId,
       value,
       date_creation as creationDate,
       date_payment  as paymentDate,
       nombre        as paymentStatus,
       money.id      as currencyId

from adm_invoices_header invoice,
     adm_estados_pago status,
     adm_account_contract contract,
     adm_money money,
     int_id_type idDocument

where contract.id = invoice.id_adm_account_contract
  and status.id = invoice.id_adm_estados_pago
  and idDocument.id = contract.id_int_id_type
  and money.id = idDocument.id_adm_money
  and contract.id = ?;
`

exports.READ_INVOICES_DETAIL_BY_CONTRACT = `
select invoice.id as invoiceId, item.name, contract_cost as cost, quantity, quantity * contract_cost as totalValue
from adm_invoices_body invoiceBody,
     int_items item,
     adm_invoices_header invoice,
     adm_account_contract contract

where item.id = invoiceBody.id_int_items
  and invoice.id = invoiceBody.id_adm_invoices_header
  and contract.id = invoice.id_adm_account_contract
  and contract.id = ?;
`
