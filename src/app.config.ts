export default defineAppConfig({
  pages: ["pages/index/index", "pages/backup/backup", "pages/user/user"],
  darkmode: false,
  subPackages: [
    {
      root: "modules",
      pages: [
        "pages/add/add",
        "pages/recycle/recycle",
        "pages/feedback/feedback",
      ],
    },
  ],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#ffffff",
    navigationBarTitleText: "WeChat",
    navigationBarTextStyle: "black",
  },
  lazyCodeLoading: "requiredComponents",
  tabBar: {
    borderStyle: "white",
    selectedColor: "#6190E8",
    color: "#333333",
    list: [
      {
        text: "首页",
        pagePath: "pages/index/index",
        iconPath: "assets/tabbar/home.png",
        selectedIconPath: "assets/tabbar/home-active.png",
      },
      {
        text: "备份 & 恢复",
        pagePath: "pages/backup/backup",
        iconPath: "assets/tabbar/backup.png",
        selectedIconPath: "assets/tabbar/backup-active.png",
      },
      {
        text: "个人中心",
        pagePath: "pages/user/user",
        iconPath: "assets/tabbar/user.png",
        selectedIconPath: "assets/tabbar/user-active.png",
      },
    ],
  },
});
