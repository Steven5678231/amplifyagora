import React from "react";
// prettier-ignore
import { Form, Button, Dialog, Input, Select, Notification } from 'element-react'
import { API, graphqlOperation } from "aws-amplify";
import { createMarket } from "../graphql/mutations";
import { UserContext } from "../App";

class NewMarket extends React.Component {
  state = {
    addMarketDialog: false,
    tags: ["Arts", "Web Dev", "Technology", "Crafts", "Entertainment"],
    selectedTags: [],
    options: [],
    name: "",
  };

  handleAddMarket = async (user) => {
    try {
      this.setState({ addMarketDialog: false });
      console.log(user.username);
      const input = {
        name: this.state.name,
        owner: user.username,
        tags: this.state.selectedTags,
      };

      const result = await API.graphql(
        graphqlOperation(createMarket, { input })
      );
      console.log({ result });
      console.info(`Create market: id ${result.data.createMarket.id}`);
      this.setState({ name: "", selectedTags: [] });
    } catch (err) {
      console.error("error adding market");
      Notification.error({
        title: "Error",
        message: `${err.message || "Error adding message"}`,
      });
    }
  };
  handleFilterTags = (query) => {
    const options = this.state.tags
      .map((tag) => ({ value: tag, label: tag }))
      .filter((tag) => tag.label.toLowerCase().includes(query.toLowerCase()));
    this.setState({ options });
  };

  render() {
    return (
      <UserContext.Consumer>
        {({ user }) => (
          <>
            <div className="market-header">
              <h1 className="market-title">
                Create Your MarketPlace
                <Button
                  type="text"
                  icon="edit"
                  className="market-title-button"
                  onClick={() => this.setState({ addMarketDialog: true })}
                />
              </h1>
              <Form inline={true} onSubmit={this.props.handleSearch}>
                <Form.Item>
                  <Input
                    placeholder="Search Markets..."
                    icon="circle-cross"
                    value={this.props.searchTerm}
                    onIconClick={this.props.handleClearSearch}
                    onChange={this.props.handleSearchChange}
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="info"
                    icon="seach"
                    onClick={this.props.handleSearch}
                    loading={this.props.isSearching}
                  >
                    Search
                  </Button>
                </Form.Item>
              </Form>
            </div>

            <Dialog
              title="Create New Market"
              visible={this.state.addMarketDialog}
              onCancel={() => this.setState({ addMarketDialog: false })}
              size="large"
              customClass="dialog"
            >
              <Dialog.Body>
                <Form labelPosition="top">
                  <Form.Item label="Add Market Name">
                    <Input
                      placeholder="MarketName"
                      trim={true}
                      onChange={(name) => this.setState({ name })}
                      value={this.state.name}
                    />
                  </Form.Item>
                  <Form.Item label="Add Tages">
                    <Select
                      multiple={true}
                      filterable={true}
                      placeholder="Market Tags"
                      onChange={(selectedTags) =>
                        this.setState({ selectedTags })
                      }
                      remoteMethod={this.handleFilterTags}
                      remote={true}
                    >
                      {this.state.options.map((option) => (
                        <Select.Option
                          key={option.value}
                          label={option.label}
                          value={option.value}
                        />
                      ))}
                    </Select>
                  </Form.Item>
                </Form>
              </Dialog.Body>
              <Dialog.Footer>
                <Button
                  onClick={() => this.setState({ addMarketDialog: false })}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  disabled={!this.state.name}
                  onClick={() => this.handleAddMarket(user)}
                >
                  Add
                </Button>
              </Dialog.Footer>
            </Dialog>
          </>
        )}
      </UserContext.Consumer>
    );
  }
}

export default NewMarket;
