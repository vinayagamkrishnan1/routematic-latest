import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {IconButton, useTheme} from 'react-native-paper';
import moment from 'moment';

const CalendarHeader = ({date, onEditClick, onNextMonth, onPreviousMonth}) => {
  const {colors} = useTheme();
  const dateStr = date.toISOString();
  const endIndex = dateStr.indexOf('T');
  const title = moment(dateStr.slice(0, endIndex)).format('MMM, YY');
  const headerDate = moment(dateStr.slice(0, endIndex)).format('ddd, MMM DD');
  return (
    <View style={styles.headerContainer(colors)}>
      {/* <Text style={styles.headerTitle}>SELECT DATE</Text>
      <View style={styles.headerInnerContainer}>
        <Text style={styles.dateHeader}>{headerDate}</Text>
        //  <IconButton
        //   icon={'pencil'}
        //   size={26}
        //   color={'#fff'}
        //   onPress={onEditClick}
        // />
      </View> */}
      <View style={styles.subHeader}>
        <View style={styles.dateIconContainer}>
          <Text style={[styles.headerTitle, {color: 'black'}]}>{title}</Text>
          {/* <View style={styles.arrowContainer}>
            <IconButton
              icon={'chevron-left'}
              size={20}
              color={'#000000'}
              onPress={onPreviousMonth}
            />
            <IconButton
              icon={'chevron-right'}
              size={20}
              color={'#000000'}
              onPress={onNextMonth}
            />
          </View> */}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: colors => ({
  //  backgroundColor: '#022B5F',
    width: '60%',
  }),
  subHeader: {
    width: '70%',
    backgroundColor: '#fff',
    height: 52,
    justifyContent: 'center',
  },
  dateIconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 16,
    color: 'white',
    margin: 10,
  },
  dateHeader: {
    fontSize: 24,
    color: 'white',
    marginVertical: 10,
    marginHorizontal: 10,
  },
  headerInnerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  arrowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 0.4,
  },
});

export default CalendarHeader;
