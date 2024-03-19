import {action, makeAutoObservable, observable, runInAction} from 'mobx';
import axios from "axios";
import {Alert} from "react-native";
import {URL} from "../network/apiConstants";
import {loginString} from "../utils/ConstantString";

class CovidStore {
    @observable isLoading = true;
    @observable accessToken = null;
    @observable isVaccinationEnabled = false;
    @observable cities = [];
    @observable resourceTypes = [];
    @observable resourceData = [];
    @observable tempResourceData = new Map();
    @observable selectedCity={};
    @observable selectedResources={};
    @observable defaultCity={};
    @observable isSearch=false;
    @observable selectedItem="";

    constructor() {
        makeAutoObservable(this)
    }

    @action initCovidStore(accessToken){
        this.accessToken=accessToken;
        this.getInitData();
    }

    @action setSelectedCity(selectedCity){
        this.selectedCity=selectedCity;
        if(this.isSearch===true){
            this.searchCovidResource();
        }else this.getResourceData();
    }



    @action setSelectedResources(selectedResources,search){
        if(search===true){
            this.isSearch = search;
            this.resourceTypes.map((item)=>{
                if(selectedResources.toString().toLowerCase().includes(item.name.toString().toLowerCase())){
                    this.selectedResources=item;
                    this.searchCovidResource();
                }
            });
        }else {
            this.isSearch = search;
            this.resourceTypes.map((item) => {
                if (selectedResources.toString().toLowerCase().includes(item.name.toString().toLowerCase())) {
                    this.selectedResources = item;
                    this.getResourceData();
                }
            });
        }
    }


    @action
    async getInitData() {
        if (this.accessToken) {
            this.cities = [];
            this.isLoading = true;
            await axios.get(URL.GET_COVID_INIT, {
                headers: this.getHeader()
            }).then(response => {
                runInAction(async () => {
                    this.isLoading = false;
                    this.cities = response.data.data.cities;
                    this.resourceTypes = response.data.data.resourcetypes;
                    this.isVaccinationEnabled = response.data.data.isvaccinationenabled;
                    await this.getProfileData();
                });
            }).catch(error => {
                if (error) {
                    this.isLoading = false;
                    console.warn("Error Here " + JSON.stringify(error));
                }
            });
        }
    }

    @action
    async getProfileData() {
        if (this.accessToken) {
            this.isLoading = true;
            await axios.get(URL.GET_USER_DETAILS, {
                headers: this.getHeader()
            }).then(response => {
                runInAction(() => {
                    this.isLoading = false;
                    this.defaultCity = {
                        "code":response.data.data.cityCode,
                        "cityName":response.data.data.cityName
                    };
                    this.selectedCity=this.defaultCity;
                });
            }).catch(error => {
                if (error) {
                    this.isLoading = false;
                    console.warn("Error Here " + JSON.stringify(error));
                }
            });
        }
    }



    @action
    async getResourceData() {
        if (this.accessToken) {
            this.isLoading = true;
            await axios.get(URL.GET_COVID_RESOURCE+this.selectedResources.id+"&cityCode="+this.selectedCity.code, {
                headers: this.getHeader()
            }).then(async response => {
                await runInAction(() => {
                    this.isLoading = false;
                    this.resourceData = response.data.data.resources;
                    this.resourceData.map((item)=>{
                       this.tempResourceData.set(item.id,item.quantity);
                    });
                });
            }).catch(error => {
                if (error) {
                    this.isLoading = false;
                    console.warn("Error Here " + JSON.stringify(error));
                }
            });
        }
    }

    @action
    setSelectedItem(selectedItem){
        this.selectedItem=selectedItem;
    }


    @action
    async saveResources() {
        this.isLoading = true;
        let body = {
            typeId: parseInt(this.selectedResources.id),
            resources: this.resourceData,
            cityCode: this.selectedCity.code
        };
        console.warn("Data : "+JSON.stringify(body));
        await axios.post(URL.SAVE_COVID_RESOURCE, body, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(() => {
                this.isLoading = false;
                if(response.data.status.code===200){
                    Alert.alert("Routematic","Data updated successfully ");
                }else {
                    Alert.alert("Routematic",loginString.somethingWentWrong);
                }
            });
        }).catch(error => {
            if (error) {
                this.isLoading = false;
                Alert.alert("Routematic",loginString.somethingWentWrong);
            }
        });
    }

    @action
    async searchCovidResource() {
        if (this.accessToken) {
            this.isLoading = true;
            await axios.get(URL.SEARCH_COVID_RESOURCE+this.selectedResources.id+"&cityCode="+this.selectedCity.code, {
                headers: this.getHeader()
            }).then(async response => {
                await runInAction(() => {
                    this.isLoading = false;
                    this.resourceData = response.data.data.resources;
                });
            }).catch(error => {
                if (error) {
                    this.isLoading = false;
                    console.warn("Error Here " + JSON.stringify(error));
                }
            });
        }
    }



    @action
    async requestForResources() {
        this.isLoading = true;
        let body = {
            typeId: parseInt(this.selectedResources.id),
            resourceId: this.selectedItem,
            cityCode: this.selectedCity.code
        };

        await axios.post(URL.SAVE_COVID_REQUEST, body, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(() => {
                this.isLoading = false;
                if(response.data.status.code===200){
                    Alert.alert("Routematic","Request updated successfully");
                }else {
                    Alert.alert("Routematic",loginString.somethingWentWrong);
                }
                console.warn("response " + JSON.stringify(response));
            });
        }).catch(error => {
            if (error) {
                this.isLoading = false;
                Alert.alert("Routematic",loginString.somethingWentWrong);
            }
        });
    }

    getHeader() {
        return {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + this.accessToken
        };
    }


}

export default new CovidStore();
