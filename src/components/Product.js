import React from "react";
import { API, graphqlOperation } from "aws-amplify";
import { S3Image } from "aws-amplify-react";
// prettier-ignore
import { Notification, Popover, Button, Dialog, Card, Form, Input, Radio } from "element-react";
import { updateProduct, deleteProduct } from "../graphql/mutations";
import { convertCentsToDollars, convertDollarsToCents } from "../utils";
import { UserContext } from "../App";
import PayButton from "./PayButton";

class Product extends React.Component {
  state = {
    updateProductDialog: false,
    description: "",
    price: "",
    shipped: false,
    deleteProductDialog: false,
  };

  handleUpdateProduct = async (productId) => {
    try {
      this.setState({ updateProductDialog: false });
      const { description, price, shipped } = this.state;
      const input = {
        id: productId,
        shipped,
        description,
        price: convertDollarsToCents(price),
      };
      const result = await API.graphql(
        graphqlOperation(updateProduct, { input })
      );
      console.log(result);
      Notification({
        title: "Success",
        message: "Product updated successfully!",
        type: "success",
        duration: 2000,
      });
    } catch (err) {
      console.error(`Failed to update product withid: ${productId}`, err);
    }
  };

  handleDeleteProduct = async (productId) => {
    try {
      this.setState({ deleteProductDialog: false });
      const input = {
        id: productId,
      };
      const result = await API.graphql(
        graphqlOperation(deleteProduct, { input })
      );
      console.log(result);
      Notification({
        title: "Success",
        message: "Product deleted successfully!",
        type: "success",
        duration: 2000,
      });
    } catch (err) {
      console.error(`Failed to delete product with ID: ${productId}`, err);
    }
  };

  render() {
    const {
      updateProductDialog,
      description,
      price,
      shipped,
      deleteProductDialog,
    } = this.state;
    const { product } = this.props;

    return (
      <UserContext.Consumer>
        {({ user }) => {
          const isProductOwner = user && user.attributes.sub === product.owner;
          return (
            <div className="card-container">
              <Card bodyStyle={{ padding: 0, minWidth: "200px" }}>
                <S3Image
                  imgKey={product.file.key}
                  theme={{
                    photoImg: { maxWidth: "100%", maxHeight: "100%" },
                  }}
                />
                <div className="card-body">
                  <h3 className="m-0">
                    <div className="items-center">
                      <img
                        src={`https://icon.now.sh/${
                          product.shipped ? "markunread_mailbox" : "mail"
                        }`}
                        alt="shipping icon"
                        className="icon"
                      />
                      {product.shipped ? "Shipped" : "Emailed"}
                    </div>
                    <div className="text-right">
                      <span className="mx-1">
                        ${convertCentsToDollars(product.price)}
                      </span>
                      {isProductOwner && <PayButton user={user} product={product}/>}
                    </div>
                  </h3>
                </div>
              </Card>

              {/* Update and Delete  */}
              <div className="text-center">
                {isProductOwner && (
                  <>
                    <Button
                      type="warning"
                      icon="edit"
                      className="m-1"
                      onClick={() =>
                        this.setState({
                          updateProductDialog: true,
                          price: convertCentsToDollars(product.price),
                          shipped: product.shipped,
                          description: product.description,
                        })
                      }
                    />
                    <Popover
                      placement="top"
                      width="160"
                      trigger="click"
                      visible={deleteProductDialog}
                      content={
                        <>
                          <p> Do you want to delete this?</p>
                          <div className="text-right">
                            <Button
                              size="mini"
                              type="text"
                              className="m-1"
                              onClick={() =>
                                this.setState({ deleteProductDialog: false })
                              }
                            >
                              Cancel
                            </Button>
                            <Button
                              type="primary"
                              size="mini"
                              className="m-1"
                              onClick={() =>
                                this.handleDeleteProduct(product.id)
                              }
                            >
                              Confirm
                            </Button>
                          </div>
                        </>
                      }
                    >
                      <Button
                        onClick={() =>
                          this.setState({ deleteProductDialog: true })
                        }
                        type="danger"
                        icon="delete"
                      />
                    </Popover>
                  </>
                )}
              </div>

              {/* Updata Product Dialog */}
              <Dialog
                title="Update Product"
                size="large"
                customClass="dialog"
                visible={updateProductDialog}
                onCancel={() => this.setState({ updateProductDialog: false })}
              >
                <Dialog.Body>
                  <Form labelPosition="top">
                    <Form.Item label="Update Description">
                      <Input
                        icon="information"
                        placeholder="Product Description"
                        trim={true}
                        value={description}
                        onChange={(description) =>
                          this.setState({ description })
                        }
                      />
                    </Form.Item>
                    <Form.Item label="Update Product Price">
                      <Input
                        type="number"
                        icon="plus"
                        placeholder="Price ($AUD)"
                        value={price}
                        onChange={(price) => this.setState({ price })}
                      />
                    </Form.Item>
                    <Form.Item label="Update Shipping">
                      <div className="text-center">
                        <Radio
                          value="true"
                          checked={shipped === true}
                          onChange={() => this.setState({ shipped: true })}
                        >
                          Shipped
                        </Radio>
                        <Radio
                          value="false"
                          checked={shipped === false}
                          onChange={() => this.setState({ shipped: false })}
                        >
                          Emailed
                        </Radio>
                      </div>
                    </Form.Item>
                  </Form>
                </Dialog.Body>

                <Dialog.Footer>
                  <Button
                    onClick={() =>
                      this.setState({ updateProductDialog: false })
                    }
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => this.handleUpdateProduct(product.id)}
                  >
                    Confirm
                  </Button>
                </Dialog.Footer>
              </Dialog>
            </div>
          );
        }}
      </UserContext.Consumer>
    );
  }
}

export default Product;
