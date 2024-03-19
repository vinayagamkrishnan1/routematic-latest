import React, { Component } from "react";
import {
  Text,
  ListView,
  FlatList,
  TextInput,
  View,
  TouchableOpacity,
  Keyboard
} from "react-native";

export default class SearchableDropDown extends Component {
  searchedItems = searchedText => {
    var ac = this.props.items.filter(function(item) {
      return item.toLowerCase().indexOf(searchedText.toLowerCase()) > -1;
    });
    let item = searchedText;
    this.setState({ listItems: ac, item: item });

    const onTextChange = this.props.onTextChange;
    if (onTextChange && typeof onTextChange === "function") {
      setTimeout(() => {
        onTextChange(searchedText);
      }, 0);
    }
  };
  renderItems = item => {
    return (
      <TouchableOpacity
        style={{ ...this.props.itemStyle }}
        onPress={() => {
          this.setState({ item: item, focus: false, tempSelected: item });
          Keyboard.dismiss();
          setTimeout(() => {
            this.props.onItemSelect(item);
          }, 0);
        }}
      >
        <Text style={{ ...this.props.itemTextStyle }}>{item}</Text>
      </TouchableOpacity>
    );
  };

  constructor(props) {
    super(props);
    this.state = { item: "", listItems: [], focus: false, tempSelected: "" };
  }

  renderFlatList() {
    if (this.state.focus) {
      return (
        <FlatList
          style={{ ...this.props.itemsContainerStyle }}
          keyboardShouldPersistTaps="always"
          data={this.state.listItems}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => this.renderItems(item)}
        />
      );
    }
  }

  componentDidMount() {
    const listItems = this.props.items;
    const defaultIndex = this.props.defaultIndex;
    if (defaultIndex && listItems.length > defaultIndex) {
      this.setState({
        listItems,
        item: listItems[defaultIndex]
      });
    } else {
      //Selecting Default First Item...
      this.setState({ listItems, item: listItems[0] });
    }
  }

  render() {
    return (
      <View
        keyboardShouldpersist="always"
        style={{ ...this.props.containerStyle }}
      >
        <TextInput
          underlineColorAndroid={this.props.underlineColorAndroid}
          onFocus={() => {
            this.setState({
              focus: true,
              item: "",
              listItems: this.props.items
            });
          }}
          onBlur={() => {
            this.setState({
              focus: false,
              item: this.state.item
                ? this.state.item
                : this.state.tempSelected
                  ? this.state.tempSelected
                  : this.state.listItems[0]
            });
          }}
          ref={e => (this.input = e)}
          onChangeText={text => {
            this.searchedItems(text);
          }}
          
          editable={this.props.editable}
          value={this.props.selectedItem}
          style={{ ...this.props.textInputStyle, color:'black' }}
          placeholderTextColor={this.props.placeholderTextColor}
          placeholder={this.props.placeholder}
        />
        {this.renderFlatList()}
      </View>
    );
  }
}
