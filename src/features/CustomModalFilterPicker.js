import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native'


import styles from '../../node_modules/react-native-modal-filter-picker/src/styles'


export default class CustomModalFilterPicker extends Component {

    renderList = () => {
        const {
            showFilter,
            autoFocus,
            listContainerStyle,
            androidUnderlineColor,
            placeholderText,
            placeholderTextColor,
            filterTextInputContainerStyle,
            filterTextInputStyle
        } = this.props;

        const filter = (!showFilter) ? null : (
            <View style={filterTextInputContainerStyle || styles.filterTextInputContainer}>
                <TextInput
                    onChangeText={this.onFilterChange}
                    autoCorrect={false}
                    blurOnSubmit={true}
                    autoFocus={autoFocus}
                    autoCapitalize="none"
                    underlineColorAndroid={androidUnderlineColor}
                    placeholderTextColor={placeholderTextColor}
                    placeholder={placeholderText}
                    style={filterTextInputStyle || styles.filterTextInput}/>
            </View>
        );

        return (
            <View style={listContainerStyle || styles.listContainer}>
                {filter}
                {this.renderOptionList()}
            </View>
        )
    };
    renderOptionList = () => {
        const {
            listViewProps,
            keyboardShouldPersistTaps
        } = this.props;

        const {ds} = this.state;
        return (
            <FlatList
                enableEmptySections={false}
                {...listViewProps}
                data={ds}
                renderItem={this.renderOption}
                keyboardShouldPersistTaps={keyboardShouldPersistTaps}
            />);

    };

    renderOption = (rowData) => {
        const {
            selectedOption,
            renderOption,
            optionTextStyle,
            selectedOptionTextStyle
        } = this.props;

        const key = rowData.item.key;
        const label = rowData.item.label;

        let style = styles.optionStyle;
        let textStyle = optionTextStyle || styles.optionTextStyle;

        if (key === selectedOption) {
            style = styles.selectedOptionStyle;
            textStyle = selectedOptionTextStyle || styles.selectedOptionTextStyle
        }

        if (renderOption) {
            return renderOption(rowData, key === selectedOption)
        } else {
            return (
                <TouchableOpacity activeOpacity={0.7}
                                  style={style}
                                  onPress={() => this.props.onSelect(key)}
                >
                    <Text style={textStyle}>{label}</Text>
                </TouchableOpacity>
            )
        }
    };

    renderCancelButton = () => {
        const {
            cancelButtonStyle,
            cancelButtonTextStyle,
            cancelButtonText
        } = this.props;

        return (
            <TouchableOpacity onPress={this.props.onCancel}
                              activeOpacity={0.7}
                              style={cancelButtonStyle || styles.cancelButton}
            >
                <Text style={cancelButtonTextStyle || styles.cancelButtonText}>{cancelButtonText}</Text>
            </TouchableOpacity>
        )
    };
    onFilterChange = (text) => {
        const {options} = this.props;
        const filter = text.toLowerCase();
        const filtered = (!filter.length)
            ? options
            : options.filter(({searchKey, label}) => (
                0 <= label.toLowerCase().indexOf(filter) ||
                (searchKey && 0 <= searchKey.toLowerCase().indexOf(filter))
            ));

        this.setState({
            filter: text.toLowerCase(),
            ds: filtered
        })
    };

    constructor(props, ctx) {
        super(props, ctx);

        this.state = {
            filter: '',
            ds: props.options
        };
    }

    componentWillReceiveProps(newProps) {
        if ((!this.props.visible && newProps.visible) || (this.props.options !== newProps.options)) {
            this.setState({
                filter: '',
                ds: newProps.options
            })
        }
    }

    render() {
        const {
            title,
            titleTextStyle,
            overlayStyle,
            cancelContainerStyle,
            renderList,
            renderCancelButton,
            visible,
            modal,
            onCancel
        } = this.props;

        const renderedTitle = (!title) ? null : (
            <Text style={titleTextStyle || styles.titleTextStyle}>{title}</Text>
        );

        return (
            <Modal
                onRequestClose={onCancel}
                {...modal}
                visible={visible}
                supportedOrientations={['portrait', 'landscape']}
            >
                <View style={overlayStyle || styles.overlay}>
                    {renderedTitle}
                    {(renderList || this.renderList)()}
                    <View style={cancelContainerStyle || styles.cancelContainer}>
                        {(renderCancelButton || this.renderCancelButton)()}
                    </View>
                </View>
            </Modal>
        )
    }
}

CustomModalFilterPicker.propTypes = {
    options: PropTypes.array.isRequired,
    onSelect: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    placeholderText: PropTypes.string,
    placeholderTextColor: PropTypes.string,
    androidUnderlineColor: PropTypes.string,
    cancelButtonText: PropTypes.string,
    title: PropTypes.string,
    noResultsText: PropTypes.string,
    visible: PropTypes.bool,
    showFilter: PropTypes.bool,
    modal: PropTypes.object,
    selectedOption: PropTypes.string,
    renderOption: PropTypes.func,
    renderCancelButton: PropTypes.func,
    renderList: PropTypes.func,
    listViewProps: PropTypes.object,
    filterTextInputContainerStyle: PropTypes.any,
    filterTextInputStyle: PropTypes.any,
    cancelContainerStyle: PropTypes.any,
    cancelButtonStyle: PropTypes.any,
    cancelButtonTextStyle: PropTypes.any,
    titleTextStyle: PropTypes.any,
    overlayStyle: PropTypes.any,
    listContainerStyle: PropTypes.any,
    optionTextStyle: PropTypes.any,
    selectedOptionTextStyle: PropTypes.any,
    keyboardShouldPersistTaps: PropTypes.string
};

CustomModalFilterPicker.defaultProps = {
    placeholderText: 'Filter...',
    placeholderTextColor: '#ccc',
    androidUnderlineColor: 'rgba(0,0,0,0)',
    cancelButtonText: 'Cancel',
    noResultsText: 'No matches',
    visible: true,
    showFilter: true,
    keyboardShouldPersistTaps: 'never'
};
