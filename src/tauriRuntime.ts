import { isTauri } from '@tauri-apps/api/core'

export function assertTauriRuntime(): void {
  if (isTauri()) {
    return
  }

  throw new Error(
    'Tauri環境が必要です。ブラウザの http://localhost:1420 ではなく、npm run tauri dev で開くアプリウィンドウを使ってください。',
  )
}

function readErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error
  }

  if (error instanceof Error) {
    return error.message
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message
  }

  return ''
}

export function formatTauriError(error: unknown): string {
  const message = readErrorMessage(error)

  if (message.includes("reading 'invoke'")) {
    return 'Tauri APIに接続できません。npm run tauri dev を再起動し、アプリウィンドウから開いてください（ブラウザタブは使えません）'
  }

  if (message.includes('no such table')) {
    return 'データベースの初期化に失敗しています。アプリを再起動しても直らない場合は、開発中の okorunner.db を削除してから再度起動してください'
  }

  if (message.length > 0) {
    return message
  }

  return '予期しないエラーが発生しました'
}
