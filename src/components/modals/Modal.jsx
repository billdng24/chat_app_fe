import { CloseOutlined, WarningOutlined } from "@ant-design/icons";
import { Button } from "antd";

export default function Modal({ close, handleOk }) {
  return (
    <>
      <div className="z-50 fixed top-0 bottom-0 right-0 left-0 bg-bgc-0.5 flex justify-center items-center">
        <div className="bg-white p-6 rounded w-[450px]">
          <div className="flex justify-between items-center ">
            <h3 className="font-semibold text-xl">Xác nhận</h3>
            <CloseOutlined onClick={close} className="cursor-pointer" />
          </div>
          <div className="py-4 flex items-center gap-8">
            <WarningOutlined className="text-4xl text-yellow-500" />
            <p className="text-lg">Bạn có chắc chắc muốn đăng xuất?</p>
          </div>
          <div className="border my-4"></div>
          <div className="flex justify-end gap-3">
            <Button onClick={close}>Hủy</Button>
            <Button onClick={handleOk} danger type="primary">
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}