import Form from 'components/form';
import Modal from 'components/modal';

/**
 * 打开表单弹框
 * @param config
 * @param config.title    弹框标题
 * @param config.content  表单内容,input或input数组
 * @param config.onOk     点击确定回调函数,参数为表单的当前值
 * @returns {{close}|*}   返回一个对象,包含close方法,用来关闭弹框
 */
export default function FormModal(config) {
  return Modal.open({
    ...config,
    content: (
      <Form
        onChange={(data, invalid) => {
            this.data = data;
            this.invalid = invalid;
          }}
      >
        {config.content}
      </Form>
    ),
    onOk: () => {
      if (Object.values(this.invalid).find(d => d)) {
        return;
      }
      config.onOk && config.onOk(this.data);
    }
  });
}