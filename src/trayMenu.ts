import { Menu } from '@tauri-apps/api/menu'
import { activatePopoverWindow, openManageWindow, type TrayRect } from './windowBehavior'

export async function createTrayMenu(getTrayRect: () => TrayRect | undefined): Promise<Menu> {
  return Menu.new({
    items: [
      {
        id: 'suggest',
        text: '提案を開く',
        action: () => {
          void activatePopoverWindow(getTrayRect()).catch((error: unknown) => {
            console.error('提案画面を開けませんでした', error)
          })
        },
      },
      {
        id: 'manage',
        text: 'タスク・統計・設定を開く',
        action: () => {
          void openManageWindow().catch((error: unknown) => {
            console.error('管理画面を開けませんでした', error)
          })
        },
      },
      { item: 'Separator' },
      { item: 'Quit', text: '終了' },
    ],
  })
}
