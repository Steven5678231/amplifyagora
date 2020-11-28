import React from "react";
import { API } from "aws-amplify";
import { Notification, Message } from "element-react";
import StripeCheckout from "react-stripe-checkout";
const stripeConfig = {
  curency: "USD",
  publishableAPIKey:
    "pk_test_51Hrbd2GTjj6OQ3AStNSGOwcU1TwRO5WIv2J7FMBPTbI87YlkC8PgFz2WImwDgXWGHQOki5qy7Le65GVjMgsGwVfn00nsKEMcCz",
};

// function component read props from parameters, there is no "this"
const PayButton = ({ product, user }) => {
  const handleCharge = async (token) => {
    try {
      const result = await API.post('orderlambda','/charge', {
        body: {
          token,
          charge: {
            currency: stripeConfig.curency,
            amount: product.price,
            description: product.description,
          }
          
        }
      })
      console.log(result)
    } catch (err) {
      //有变量用 ` ${}`
      console.error("Paying Error!", err);
    }
  };

  return (
    <StripeCheckout
      token={handleCharge}
      currency={stripeConfig.currency}
      stripeKey={stripeConfig.publishableAPIKey}
      email={user.attributes.email}
      name={product.description}
      amount={product.price}
      billingAddress={product.shipped}
      shippingAddress={product.shipped}
      locale="auto"
      allowRememberMe={false}
    />
  );
};

export default PayButton;
