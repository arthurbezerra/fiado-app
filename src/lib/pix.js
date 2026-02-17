function field(id, value) {
  const len = String(value.length).padStart(2, '0')
  return `${id}${len}${value}`
}

function crc16(str) {
  let crc = 0xffff
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff
      } else {
        crc = (crc << 1) & 0xffff
      }
    }
  }
  return crc
}

// Strip diacritics — Pix EMV requires ASCII for merchant name/city
function ascii(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7E]/g, '')
}

export function buildPixPayload({ chavePix, valor, nomeLoja = 'Fiado App', cidade = 'Brasil', descricao = '' }) {
  let merchantAccount = field('00', 'br.gov.bcb.pix')
  merchantAccount += field('01', chavePix)
  if (descricao) {
    merchantAccount += field('02', descricao.slice(0, 72))
  }

  const additionalData = field('05', '***')

  const merchantName = ascii(nomeLoja).slice(0, 25)
  const merchantCity = ascii(cidade).slice(0, 15)

  let payload = ''
  payload += field('00', '01')
  payload += field('26', merchantAccount)
  payload += field('52', '0000')
  payload += field('53', '986')
  payload += field('54', Number(valor).toFixed(2))
  payload += field('58', 'BR')
  payload += field('59', merchantName)
  payload += field('60', merchantCity)
  payload += field('62', additionalData)
  payload += '6304'

  const crc = crc16(payload)
  payload += crc.toString(16).toUpperCase().padStart(4, '0')

  return payload
}
