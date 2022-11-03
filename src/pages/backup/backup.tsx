import { View } from "@tarojs/components";
import { Button, Empty, Flex } from "@taroify/core";
import { useEffect, useState } from "react";

import Taro, {
  chooseMessageFile,
  getFileSystemManager,
  shareFileMessage,
  showToast,
} from "@tarojs/taro";
import "./backup.scss";
import { addSecrets, getSecrets } from "../../storage";
import Layout from "../../components/layout";

interface FileStat {
  size: number;
  lastModified: Date;
}

export default function Backup() {
  const fs = getFileSystemManager();
  const filePath = `${Taro.env.USER_DATA_PATH}/otp-backup.json`;
  const [stat, setStat] = useState<FileStat>();
  const backup = async () => {
    let secrets = await getSecrets();
    fs.writeFile({
      filePath: filePath,
      data: JSON.stringify(secrets),
      encoding: "utf8",
      fail: () => {
        showToast({
          title: "写入本地文件失败",
          icon: "error",
        });
      },
      success: async () => {
        await shareFileMessage({
          filePath: filePath,
          success: () => {
            showToast({
              title: "备份成功",
              icon: "success",
            });
          },
          fail: () => {
            showToast({
              title: "备份失败",
              icon: "error",
            });
          },
        });
      },
    });
  };
  const restore = async () => {
    await chooseMessageFile({
      count: 1,
      type: "file",
      extension: ["json"],
      success: async (res) => {
        const tempFiles = res.tempFiles;
        if (tempFiles.length == 0) {
          return;
        }
        const tempFilePath = tempFiles[0].path;
        fs.readFile({
          filePath: tempFilePath,
          success: async (r) => {
            let secrets;
            try {
              secrets = JSON.parse(r.data as string);
            } catch (e) {
              await showToast({
                title: "无效的备份文件",
                icon: "error",
              });
              return;
            }
            await addSecrets(secrets);
            await showToast({
              title: "恢复成功",
              icon: "success",
            });
          },
        });
      },
      fail: async (r) => {
        let errMsg = r.errMsg;
        if (errMsg == "chooseMessageFile:fail cancel") {
          return;
        }
        await showToast({
          title: "恢复失败",
          icon: "error",
        });
      },
    });
  };
  useEffect(() => {
    fs.stat({
      path: filePath,
      success: (r) => {
        let stats = r.stats;
        setStat({
          size: stats.size,
          lastModified: new Date(stats.lastModifiedTime * 1000),
        });
      },
    });
  });
  return (
    <Layout title="备份 & 恢复" navbar={<View />}>
      <Flex direction="column" align="center">
        <Flex.Item className="item">
          <Empty>
            <Empty.Image />
            <Empty.Description>
              备份到本地文件，或者从本地文件恢复。密钥内容将以JSON格式存储在本地文件中。
            </Empty.Description>
          </Empty>
        </Flex.Item>
        {stat && (
          <Flex.Item className="item">
            <View className="backup-info">
              <View>备份文件大小：{stat.size} 字节</View>
              <View>最后修改时间：{stat.lastModified.toLocaleString()}</View>
            </View>
          </Flex.Item>
        )}
        <Flex.Item className="item">
          <Button color="primary" shape="round" onClick={backup}>
            备份到本地文件
          </Button>
        </Flex.Item>
        <Flex.Item className="item" onClick={restore}>
          <Button shape="round">从本地文件恢复</Button>
        </Flex.Item>
      </Flex>
    </Layout>
  );
}
