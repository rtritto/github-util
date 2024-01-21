interface Tag {
  name: string
  zipball_url: string
  tarball_url: string
  commit: {
    sha: string
    url: string
  },
  node_id: string
}

interface Asset {
  url: string
  id: number
  node_id: string
  name: string
  label: string
  uploader: Object[],
  content_type: string
  state: string
  size: number
  download_count: number
  created_at: string
  updated_at: string
  browser_download_url: string
}

interface TagDetail {
  url: string
  name: string
  tag_name: string
  assets: Asset[]
}



declare module 'github-util' {
  export function downloadRelease(owner: string, repo: string, assetNumber: number, targetFolder: string): Promise<void>
}