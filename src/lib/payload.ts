import { PayloadSDK } from '@payloadcms/sdk'
import type { Config } from '@lib/types/payload-types'

const payload = new PayloadSDK<Config>({
  baseURL: 'https://api.cibmangotree.org/api',
})

export default payload
