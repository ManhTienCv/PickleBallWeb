import crypto from 'crypto'

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    const { orderCode = `ORD-${Date.now()}`, amount = 50000, redirectUrl: clientRedirect } = req.body || {}

    const partnerCode = process.env.MOMO_PARTNER_CODE || 'MOMOBKUN20180529'
    const accessKey = process.env.MOMO_ACCESS_KEY || 'klm05TvNBzhg7h7j'
    const secretKey = process.env.MOMO_SECRET_KEY || 'at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa'
    const endpoint = 'https://test-payment.momo.vn/v2/gateway/api/create'

    const timestamp = Date.now()
    const fullOrderId = `${orderCode}_${timestamp}`
    const requestId = `REQ_${timestamp}`
    const numAmount = Math.round(Math.max(1000, Number(amount) || 50000))
    const orderInfo = `Thanh toan don hang #${orderCode}`
    const extraData = ''
    const requestType = 'captureWallet'

    // Tự động xác định redirect URL nếu client không gửi lên
    const host = req.headers.host || 'demopick-client.vercel.app'
    const proto = req.headers['x-forwarded-proto'] || 'https'
    const defaultRedirect = `${proto}://${host}/payment/momo/callback`
    const redirectUrl = clientRedirect || defaultRedirect
    const ipnUrl = defaultRedirect

    const rawSignature =
      `accessKey=${accessKey}` +
      `&amount=${numAmount}` +
      `&extraData=${extraData}` +
      `&ipnUrl=${ipnUrl}` +
      `&orderId=${fullOrderId}` +
      `&orderInfo=${orderInfo}` +
      `&partnerCode=${partnerCode}` +
      `&redirectUrl=${redirectUrl}` +
      `&requestId=${requestId}` +
      `&requestType=${requestType}`

    const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex')

    const payload = {
      partnerCode,
      partnerName: 'DemoPick Sports',
      storeId: 'DemoPickStore',
      requestId,
      amount: numAmount,
      orderId: fullOrderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      lang: 'vi',
      extraData,
      requestType,
      signature,
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await response.json()
    return res.status(200).json(data)
  } catch (err) {
    console.error('MoMo Vercel serverless error:', err)
    return res.status(500).json({ error: 'Failed to create MoMo payment', details: err.message })
  }
}
