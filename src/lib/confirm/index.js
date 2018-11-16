import React, { Component } from 'react';

import Modal from 'components/modal';

export default function confirm(config) {
  const modal = Modal.open({
    ...config,
    onOk: () => {
      config.onOk && config.onOk();
      modal.close();
    }
  });
}