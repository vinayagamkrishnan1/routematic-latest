import React, {Component} from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, RefreshControl} from 'react-native';
import moment from "moment";
import normalize from '../../utilities/normalize';
import { colors } from '../../utils/Colors';
import { inject, observer } from 'mobx-react';
import { spinner } from '../../network/loader/Spinner';

@inject("homeStore")
@observer
class NotificationList extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      refreshing: false,
      notifications:[],
    };
  }

  UNSAFE_componentWillMount() {
    
  }

  componentDidMount() {
    this.props.homeStore.getNotificationsList(this);
  }

  _onRefresh() {
    this.setState({refreshing:true});
    this.props.homeStore.getNotificationsList(this).then(()=>{
        this.setState({refreshing:false});
    });
  }

  renderItemComponent = notification => (
    <TouchableOpacity style={notification.status === 'R' ? styles.itemContainer : styles.itemContainerN} >
      <View style={styles.offerItem}>
        <Text style={styles.status}>{moment(notification.logTime).format("DD-MM-YYYY hh:mm A")}</Text>
        <Text style={notification.status === 'R' ? styles.title : styles.titleN}>{notification.msgDescription}</Text>
        <Text style={styles.description}>{notification.pushMessage}</Text>
      </View>
    </TouchableOpacity>
  );

  _renderNotificationEmptyList = () => (
    <Text style={styles.emptyListStyle}>
      Notifications not found
    </Text>
  );

  render() {
    return (
      <SafeAreaView style={styles.safeArea}>
        {spinner.visible(this.props.homeStore.isLoading)}
        <View style={styles.container}>
          <FlatList
            data={this.state.notifications}
            renderItem={({item}) => this.renderItemComponent(item)}
            ListEmptyComponent={this._renderNotificationEmptyList}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={this.state.refreshing}
                    onRefresh={this._onRefresh.bind(this)}
                />
            }
          />
        </View>
      </SafeAreaView>
    );
  }
}

export default NotificationList;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    margin: normalize(16),
  },
  emptyListStyle: {
    color: '#d4d4d4',
    fontSize: normalize(20),
    textAlign: 'center',
  },
  title: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: normalize(12),
    lineHeight: 21,
    textTransform: 'uppercase',
    color: '#101D40',
  },
  titleN: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: normalize(12),
    lineHeight: 21,
    textTransform: 'uppercase',
    color: colors.BLUE
  },
  status: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: normalize(10),
    lineHeight: 16,
    textTransform: 'capitalize',
    color: '#666666',
  },
  description: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: normalize(12),
    lineHeight: 15,
    color: '#181818',
    paddingVertical: normalize(2),
    marginVertical: normalize(4),
  },
  btnViewMore: {
    alignSelf: 'flex-start',
  },
  viewMore: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: normalize(10),
    textTransform: 'capitalize',
    lineHeight: 16,
    color: '#F25E00',
    textDecorationColor: '#F25E00',
    textDecorationLine: 'underline',
  },
  itemContainer: {
    borderColor: '#6666664D',
    borderRadius: normalize(4),
    borderWidth: 1,
    marginBottom: normalize(16),
  },
  itemContainerN: {
    // backgroundColor: '#d8bfd8',
    borderRadius: normalize(5),
    borderWidth: 3,
    borderColor: colors.BLUE,
    marginBottom: normalize(16),
  },
  offerItem: {
    margin: normalize(16),
  },
});
