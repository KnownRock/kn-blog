import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    // the translations
    // (tip move them in a JSON file and import them,
    // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
    resources: {
      en: {
        translation: {
          'file.delete.title': 'Delete file',
          'file.delete.description': 'Are you sure you want to delete this file?',
          'folder.delete.title': 'Delete folder',
          'folder.delete.description': 'Are you sure you want to delete this folder?',
          'files.newFile.title': 'New file',
          'files.newFile.placeholder': 'File name',
        },
      },
      cn: {
        translation: {
          'Write something...': '写点什么...',
          Title: '标题',
          Upload: '上传',
          Delete: '删除',
          Rename: '重命名',
          root: '根目录',
          Folders: '文件夹',
          Files: '文件',
          Download: '下载',
          'Upload folder': '上传文件夹',
          'New name': '新名称',
          'Ok': '确定',
          'Cancel': '取消',
          'file.delete.title': '删除文件',
          'file.delete.description': '确定要删除这个文件吗？',
          'New File': '新建文件',
          'folder.delete.title': '删除文件夹',
          'folder.delete.description': '确定要删除这个文件夹吗？',
          'files.newFile.title': '新建文件',
          'files.newFile.placeholder': '文件名',
          'Remote Folders': '远程文件夹',
        },
      },
    },
    lng: 'cn', // if you're using a language detector, do not define the lng option
    fallbackLng: 'cn',

    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
  })
