import {View} from "@tarojs/components";
import {Button, Empty, Flex} from "@taroify/core";
import {useCallback, useEffect, useState} from "react";

import Taro, {
  chooseMessageFile,
  getFileSystemManager,
  shareFileMessage,
} from "@tarojs/taro";
import "./backup.scss";
import Layout from "../../components/layout";
import {addOTPs, getOTPs} from "../../storages/otp";
import {loadAndUpdateOTP} from "../../services/otp";
import * as toast from "../../components/toast";

interface FileStat {
  size: number;
  lastModified: Date;
}

export default function Backup() {
  const fs = getFileSystemManager();
  const filePath = `${Taro.env.USER_DATA_PATH}/otp-backup.json`;
  const [stat, setStat] = useState<FileStat>();
  const backup = () => {
    getOTPs().then((secrets) => {
      fs.writeFile({
        filePath: filePath,
        data: JSON.stringify(secrets),
        encoding: "utf8",
        fail: () => {
          toast.fail("写入本地文件失败");
        },
        success: () => {
          loadStat();
        },
      });
    });
    shareFileMessage({
      filePath: filePath,
      success: () => {
        toast.success("备份成功");
      },
      fail: (e) => {
        if (e.errMsg == "shareFileMessage:fail canceled") {
          return;
        }
        toast.fail("备份失败");
      },
    }).then(() => {
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
          encoding: "utf8",
          success: async (r) => {
            let secrets;
            try {
              secrets = JSON.parse(r.data as string);
            } catch (e) {
              toast.fail("无效的备份文件");
              return;
            }
            await addOTPs(secrets);
            await loadAndUpdateOTP();
            toast.success("恢复成功");
          },
        });
      },
      fail: async (r) => {
        let errMsg = r.errMsg;
        if (errMsg == "chooseMessageFile:fail cancel") {
          return;
        }
        toast.fail("恢复失败");
      },
    });
  };
  const loadStat = useCallback(() => {
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
  }, [fs, filePath]);
  useEffect(() => {
    loadStat();
  }, [loadStat]);
  return (
    <Layout title="备份 & 恢复" navbar={<View/>} padding="0">
      <Flex direction="column" align="center">
        <Flex.Item className="item">
          <Empty>
            <Empty.Image/>
            <Empty.Description>
              密钥内容将以JSON格式存储在本地文件中。因微信小程序限制，你只能备份到聊天消息和从聊天消息恢复。你可以将备份文件发送到文件传输助手。
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
            备份到聊天消息
          </Button>
        </Flex.Item>
        <Flex.Item className="item" onClick={restore}>
          <Button shape="round">从聊天消息恢复</Button>
        </Flex.Item>
      </Flex>
    </Layout>
  );
}
