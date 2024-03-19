import React, {Component} from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    PermissionsAndroid,
    Platform,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    Text,
    View,
} from "react-native";
import {colors} from "../../utils/Colors";
import {Button} from "native-base";
import TouchableDebounce from "../../utils/TouchableDebounce";
import Icon from "react-native-vector-icons/FontAwesome";
import {inject, observer} from "mobx-react";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

@inject("covidStore")
@observer
class ResourceListing extends Component {
    static navigationOptions = ({navigation}) => {
        return {
            title: '' // navigation.getParam("title"),
        };
    };
    state = {
        isLoading: false,
        refreshing: false,
        resourceData:[]

    };
    renderEmptyList = () => {
        return (
            <View
                style={{
                    justifyContent: "center",
                    alignItems: "center",
                    flex: 1,
                    margin: 10
                }}
            >
                <Text style={{textAlign: "center"}}>No resources available</Text>
            </View>
        );
    };

    render() {
        let data = this.props.covidStore.resourceData;
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: colors.WHITE}}>
                <View style={{flex: 1, backgroundColor: colors.WHITE, flexDirection: 'column'}}>
                    <StatusBar barStyle="dark-content"/>
                    <FlatList
                        style={{minHeight: 100, marginBottom: 60}}
                        keyExtractor={this._keyExtractor}
                        data={data}
                        renderItem={this.renderItem.bind(this)}
                        ListEmptyComponent={this.renderEmptyList}
                        ListHeaderComponent={this.listHeader(this.props.covidStore)}
                        refreshing={this.state.isLoading}
                    />
                        <Button
                            style={{
                                width: "100%",
                                height: 50,
                                justifyContent: "center",
                                alignItems: "center",
                                position: "absolute",
                                bottom: 0,
                                backgroundColor: colors.BLUE,
                                flexDirection: "row"
                            }}
                            full
                            bordered
                            onPress={() => {
                                let hasChanged = false;
                                for(let i=0;i<this.props.covidStore.resourceData.length;i++){
                                    let item = this.props.covidStore.resourceData[i];
                                    console.warn("Item 1 "+JSON.stringify(this.props.covidStore.tempResourceData.get(item.id)));
                                    console.warn("IT 2 "+JSON.stringify(item));
                                    if(this.props.covidStore.tempResourceData.get(item.id) !==item.quantity) {
                                        console.warn("Item  3"+JSON.stringify(item));
                                        hasChanged = true;
                                        break
                                    }
                                }
                                if(hasChanged===true) {
                                    this.props.covidStore.saveResources().then((response) => {
                                        this.props.navigation.goBack();
                                    });
                                }else{
                                    alert("Please add the resource");
                                }
                            }}
                        >
                            <Text style={buttonTextStyle}>Save</Text>
                        </Button>
                </View>
            </SafeAreaView>
        );
    }

    componentDidMount(){
        let title = this.props.route.params.title; // ", "Covid19 Help");
        this.setState({resourceData:this.props.covidStore.resourceData,title});
    }

    listHeader=(store)=>{
      return(<View style={{backgroundColor: colors.WHITE, borderRadius: 8}}>
              <TouchableDebounce
                  onPress={() => {
                      this.props.navigation.navigate('CitySelection',{
                          selectedValue:store.selectedCity.hasOwnProperty('name')?store.selectedCity.name:store.defaultCity.cityName
                      });
                  }}
              >
                  {this._renderOffice("City", store.selectedCity.hasOwnProperty('name')?store.selectedCity.name:store.defaultCity.cityName)}
              </TouchableDebounce>
          </View>
      )
    };

    _renderOffice = (title, Office) => {
        return (
            <View style={{flexDirection: "column", padding: 20}}>
                <Text style={titleStyle}>{title}</Text>
                <View style={{flexDirection: "row", marginTop: 5}}>
                    <MaterialIcons name={"location-on"} size={24} color={'#9E9E9E'}/>
                    <Text style={officeNameStyle}>{Office}</Text>
                </View>
            </View>
        );
    };


    renderItem(data) {
        return (
            <View
                style={parentContainer}>
                <View style={{flex: 0.7, padding: 6}}>
                    <Text style={routeName}>{data.item.name}</Text>
                </View>
                {data.item.quantity > 0? (
                    <View style={itemContainer}>
                        <TouchableDebounce
                            onPress={() => {
                                if (data.item.quantity > 0) {
                                    data.item.quantity--;
                                }
                                this.setState({set: true});
                            }}
                            style={button}
                        >
                            <Icon name="minus" color={colors.GRAY} size={20}
                                  style={{fontSize: 20, color: colors.GRAY}}/>
                        </TouchableDebounce>
                        <Text
                            style={[routeName, {
                                justifyContent: 'center',
                                alignSelf: 'center',
                                alignItems: 'center',
                            }]}>{data.item.quantity ? data.item.quantity : 0}</Text>
                        <TouchableDebounce
                            onPress={() => {
                                data.item.quantity++;
                                this.setState({set: true});
                            }}
                            style={button}
                        >
                            <Icon name="plus" color={colors.GREEN} size={20}/>
                        </TouchableDebounce>
                    </View>):(
                    <View style={{
                        flex: 0.3,
                        height:40,
                        borderRadius: 6,
                        justifyContent:'center',
                        alignItems:'center',
                        borderWidth: 1,
                        borderColor: colors.GRAY,
                        padding: 6
                    }}>
                        <TouchableDebounce
                            onPress={() => {
                                data.item.quantity++;
                                this.setState({set: true});
                            }}
                            style={{justifyContent:'center',alignContent:'center'}}
                        >
                            <Text
                                style={[routeName, {
                                    justifyContent: 'center',
                                    alignSelf: 'center',
                                    color:colors.GREEN,
                                    alignItems: 'center',
                                }]}>ADD</Text>
                        </TouchableDebounce>
                    </View>
                )}

            </View>
        );
    }

    _keyExtractor(item, index) {
        return index.toString();
    }

    renderSeparator() {
        return <View style={styles.separator}/>;
    }
}

export default ResourceListing;

const routeName = {
    fontFamily: "Helvetica",
    fontSize: 16,
    fontStyle: "normal",
    letterSpacing: 0,
    color: "#000000"
};
const parentContainer = {
    flex: 1,
    flexDirection: "row",
    margin: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.WHITE,
    borderRadius: 8
};
const button = {
    width: 28,
    height: 28,
    justifyContent: 'center',
    background: colors.GRAY,
    alignSelf: 'center',
    alignItems: 'center',
};
const itemContainer = {
    flex: 0.3,
    height:40,
    flexDirection: "row",
    justifyContent: 'space-between',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.GRAY,
    padding: 6
};

const buttonTextStyle = {
    fontFamily: "Helvetica",
    fontSize: 22,
    letterSpacing: 2,
    color: colors.WHITE,
    fontWeight: 'bold',
    alignSelf:'center',
    justifyContent:'center',
    alignItems:'center',
    borderRadius:6
};
const officeNameStyle = {
    width: "100%",
    fontFamily: "Helvetica",
    fontSize: 18,
    // fontWeight: "500",
    textAlign: "left",
    color: colors.BLACK,
    marginLeft: 5
};
const titleStyle = {
    fontFamily: "Helvetica",
    fontSize: 13,
    textAlign: "left",
    color: "#9E9E9E"
};
