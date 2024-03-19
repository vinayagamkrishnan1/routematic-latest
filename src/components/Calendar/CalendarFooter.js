import React from 'react';
import {View, StyleSheet} from 'react-native';
import BottomShadow from '../BottomShadow/BottomShadow';
import StandardButton from '../Buttons';

const CalendarFooter = ({
  negativeName,
  positiveName,
  negativeHandler,
  positiveHandler,
}) => {
  return (
    // <View style={styles.container}>
    //   <StandardButton
    //     name={negativeName}
    //     onPress={negativeHandler}
    //     color={'#F25E00'}
    //   />
    //   <StandardButton
    //     name={positiveName}
    //     onPress={positiveHandler}
    //     color={'#F25E00'}
    //   />
    // </View>
    <BottomShadow style={styles.container}>
      <StandardButton
        name={negativeName}
        onPress={negativeHandler}
        color={'#4a90e2'}
      />
      <StandardButton
        name={positiveName}
        onPress={positiveHandler}
        color={'#4a90e2'}
      />
    </BottomShadow>
  );
};

export default CalendarFooter;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    borderBottomEndRadius: 10,
    borderBottomStartRadius: 10,
    height: 54
    // shadowColor: '#000',
    // shadowOffset: {width: 1, height: 1},
    // shadowOpacity: 0.4,
    // shadowRadius: 3,
    // elevation: 5,
  },
});
