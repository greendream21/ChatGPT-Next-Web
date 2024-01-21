import { IconButton } from "./button";
import { Modal } from "./ui-lib";
import Locale from "../locales";

import ConfirmIcon from "../icons/confirm.svg";
import CancelIcon from "../icons/cancel.svg";

import styleModal from "./payment.module.scss";
import axios from "axios";

export default function PaymentPage(props: any) {
  const client_id = process.env.CLIENT_ID;
  const client_secret = process.env.CLIENT_SECRET;
  const basic = process.env.BASIC;

  const payment_auth = async () => {
    try {
      const data = {
        client_id,
        client_secret,
        basic,
      };
      const response = await axios.post("/api/payment", data);
      console.log("Response: ", response);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="modal-mask">
      <Modal
        title="Payment Page"
        onClose={props.onClose}
        actions={[
          <IconButton
            type="primary"
            text={Locale.UI.Cancel}
            icon={<CancelIcon />}
            key="cancel"
            onClick={() => {
              props.onClose();
            }}
          />,
        ]}
      >
        <div className={styleModal["container"]}>
          <div className={styleModal["pricing__table"]}>
            <div className={styleModal["icon type-01"]}>
              <span
                className={styleModal["fa fa-paper-plane"]}
                aria-hidden="true"
              ></span>
            </div>
            <h1 className={styleModal["service__price"]}>
              <sup className={styleModal["dollar__sign"]}>$5</sup>
              <sup className={styleModal["service__period"]}>Per Month</sup>
            </h1>

            <ul className={styleModal["features__list"]}>
              <li>
                <ConfirmIcon className={styleModal["check"]} />
                300 Queries
              </li>
            </ul>
            <button
              className={styleModal["order__button"]}
              onClick={() => {
                payment_auth();
              }}
            >
              SUBMIT
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
