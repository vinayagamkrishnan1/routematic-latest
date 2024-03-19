import React from 'react';
// import StandardAppBar from '../../components/Appbar';
// import AppBarAction from '../../components/Appbar/appBarAction';
// import AppBarContent from '../../components/Appbar/appBarContent';
import {StyleSheet} from 'react-native';
import {colors} from '../../utils/Colors';

function AsideStackAppBar({navigation, options}) {
  const _onGoBack = () => {
    navigation.goBack();
  };
  return (
    <StandardAppBar
      style={styles.container}
      children={
        <>
          <AppBarAction
            onPress={_onGoBack}
            color={colors.ORANGE}
            icon={'keyboard-backspace'}
          />
          <AppBarContent
            color={colors.APP_SECONDARY}
            title={options.title}
            titleStyle={options.headerTitleStyle}
          />
        </>
      }
    />
  );
}

export default AsideStackAppBar;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    shadowColor: '#000000',
    shadowOpacity: 1,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 1,
    },
    borderBottomColor: '#d4d4d4',
    borderWidth: 2,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "transparent",
  }
});
