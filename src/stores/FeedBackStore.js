import {action, makeAutoObservable, observable, runInAction} from 'mobx';
import axios from "axios";
import React from "react";
import {Alert, Platform} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {URL} from "../network/apiConstants";
import {asyncStorageKeys, asyncString, loginString} from "../utils/ConstantString";
import * as Alert1 from "../utils/Alert";
import moment from "moment";
import {StackActions} from "@react-navigation/native";
import base64 from "react-native-base64";
import { CryptoXor } from 'crypto-xor';

var utf8 = require('utf8');
const feedBack = "FeedBack";

class FeedBackStore {

    /*-------App tokens and config -------*/
    @observable isLoading = false;
    @observable accessToken = '';
    @observable customUrl = '';
    @observable UserId = '';
    @observable IdleTimeOutInMins = 0;
    @observable context;
    @observable navigation;
    /*-------End of tokens and config -------*/


    @observable recentTrips = [];
    @observable myTickets = [];
    @observable feedbackRequestObject = {
        rating: 0,
        categoryId: undefined,
        subCategoryId: undefined,
        comments: "",
        tripid: undefined,
        shiftDate: undefined,
        shiftTime: undefined
    };
    @observable categoriesList = [];
    @observable subCategoryList = [];
    @observable selectedCategory = {};
    @observable pagestate = undefined;
    @observable MyTicketData = {};
    @observable reOpenId="";

    constructor() {
        makeAutoObservable(this)
    }

    @action
    clearSession(){
        console.warn("Clear session");
        this.recentTrips=[];
        this.myTickets=[];
        this.feedbackRequestObject={
            rating: 0,
            categoryId: undefined,
            subCategoryId: undefined,
            comments: "",
            tripid: undefined,
            shiftDate: undefined,
            shiftTime: undefined
        };
        this.selectedCategory={};
        this.pagestate=undefined;
        this.MyTicketData={};
        this.reOpenId="";
    }

    @action
    setReOpen(id){
        this.reOpenId=id;

    }

    @action
    setCategory(category) {
        this.feedbackRequestObject.categoryId = category.id;
        this.selectedCategory = category;
        this.navigation.navigate('SubCategory');
    }

    @action
    setSubCategory(subCategory) {
        this.feedbackRequestObject.subCategoryId = subCategory.id
    }

    @action
    setComments(comments) {
        this.feedbackRequestObject.comments = comments;
    }

    @action
    setRatings(rating) {
        this.feedbackRequestObject.rating = rating;
    }

    @action
    goBackAction() {
        this.navigation.goBack();
    }

    setInitFeedBack(context, navigation) {
        this.context = context;
        this.navigation = navigation;
        AsyncStorage.multiGet(
            [
                asyncString.ACCESS_TOKEN,
                asyncString.USER_ID,
                asyncString.IdleTimeOutInMins,
                asyncString.CAPI
            ],
            (err, savedData) => {
                this.isLoading = true;
                this.accessToken = CryptoXor.decrypt(savedData[0][1], asyncString.ACCESS_TOKEN); // JSON.parse(JSON.stringify(savedData[0][1]));
                this.UserId = JSON.parse(JSON.stringify(savedData[1][1]));
                this.customUrl = savedData[3][1];
                this.IdleTimeOutInMins = parseInt(savedData[2][1]);
                this.getRecentTrips();
                this.getMyTickets(true);
            }
        );
    }

    getHeader() {
        return {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + this.accessToken
        };
    }


    @action
    async getRecentTrips() {
        this.isLoading = true;
        let url401 = "https://run.mocky.io/v3/cf47b25a-be68-4b49-987f-846f36dcf0e3";
        //await axios.get(url401, {
        await axios.get(URL.RECENT_TRIPS + "pf=1", {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => {
                this.isLoading = false;
                let data = response.data;
                if (data.status.code === 200) {
                    this.recentTrips = data.data.pendingFeedback;
                } else if (data.status.message) {
                    Alert1.show(feedBack, data.status.message);
                    this.recentTrips = [];
                } else {
                    Alert1.show(feedBack, loginString.somethingWentWrong);
                }
            });
        }).catch(error => {
            console.warn('Recent trips error - ', error);
            if (error) {
                this.isLoading = false;
                Alert1.show(feedBack, loginString.somethingWentWrong);
            }
        });
    }

    @action
    async onStarRatingPressEvent(rating, item) {
        console.warn('Recent trip - ', item);
        this.isLoading = true;
        var additionalFB = false;
        var enableComment = false;
        if (item) {
            let momentDate = moment(item.shiftTime);
            let hour = momentDate.hours();
            let minutes = momentDate.minutes();
            this.feedbackRequestObject = {
                tripId: item.tripId,
                shiftDate: item.shiftTime,
                shiftTime: hour + ":" + minutes,
                rating: rating,
                devicecode: this.UserId,
                categoryId: "",
                subCategoryId: "",
                comments: "",
                apiurl: this.customUrl
            };

            var baseRating = 3;
            if (item.baseRating == "0") {
                baseRating = 0;
            } else if (Number(item.baseRating)) {
                baseRating = Number(item.baseRating);
            } 
            if(rating <= baseRating) additionalFB = true;
            if(!additionalFB && rating >= 4) enableComment = true;
            console.warn('additionalFB - ', additionalFB, ' | enableComment - ', enableComment);
        } else {
            if (rating < 4) additionalFB = true;
            this.feedbackRequestObject.apiurl = this.customUrl;
            this.feedbackRequestObject.devicecode = this.UserId;
            this.feedbackRequestObject.rating = rating;
        }
        if (additionalFB) { // rating < 4
            return await this.getCategoriesData();
        } else if (enableComment) {
            this.isLoading = false;
            await this.navigation.navigate('Comments', {
                commentOptional: "1"
            });
        } else if (item) {
            this.isLoading = false;
            Alert.alert(
                "Feedback",
                "Do you want to submit the rating?",
                [
                    {
                        text: "No",
                        onPress: () => console.log("NO Pressed"),
                        style: "cancel"
                    },
                    {
                        text: "Yes",
                        onPress: () => {
                            this.submitFeedback(" ");
                        }
                    }
                ],
                {cancelable: true}
            );
        } else {
            this.isLoading = false;
            await this.navigation.navigate('Comments');
        }
    }

    generalFeedback() {
        console.warn('generalFeedback called - ', this.navigation);
        this.navigation.navigate('GeneralFeedback');
    }

    @action
    async getMyTickets(first) {
        this.isLoading = true;
        let url = URL.RECENT_TRIPS + "limit=10&f=1";
        if (true !== first) if (this.pagestate !== undefined) {
            let text = "td=" + encodeURIComponent(this.pagestate);
            let bytes = utf8.encode(text);
            let encoded = base64.encode(bytes);
            url = URL.RECENT_TRIPS + "limit=10&f=1&pagestate=" + encoded;
        }
        await axios.get(url, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => {
                this.isLoading = false;
                let data = response.data;
                let array = this.myTickets.slice();
                if (data.status.code === 200) {
                    if (this.pagestate === undefined||(true === first)) {
                        this.myTickets = data.data.tickets;
                    } else {
                        data.data.tickets.map((item)=>{
                           array.push(item);
                        });
                        this.myTickets.replace(array);
                    }
                    this.pagestate = data.data.pageState;
                } else if (data.status.message) {
                    Alert1.show(feedBack, data.status.message);
                    this.pagestate = undefined;
                    this.myTickets = [];
                } else {
                    Alert1.show(feedBack, loginString.somethingWentWrong);
                }
            });
        }).catch(error => {
            if (error) {
                this.isLoading = false;
                Alert1.show(feedBack, loginString.somethingWentWrong);
            }
        });
    }


    @action
    async getCategoriesData() {
        this.isLoading = true;
        await axios.get(URL.CATEGORIES, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => {
                this.isLoading = false;
                if (response.data.status.code === 200) {
                    this.categoriesList = response.data.data;
                    await this.navigation.navigate('Categories');
                } else if (response.data.status.message) {
                    Alert1.show(feedBack, response.data.status.message);
                } else {
                    Alert1.show(feedBack, loginString.somethingWentWrong);
                }
            });
        }).catch(error => {
            if (error) {
                this.isLoading = false;
                Alert1.show(feedBack, loginString.somethingWentWrong);
            }
        });
    }


    @action
    async getTicketDetails(ticketId) {
        this.isLoading = true;
        this.selectedCategory={};
        await axios.get(URL.Get_MyTicket_ByID + ticketId, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => {
                this.isLoading = false;
                if (response.data.status.code === 200) {
                    this.MyTicketData = response.data.data;
                    await this.navigation.navigate('MyTicketDetails');
                } else if (response.data.status.message) {
                    Alert1.show(feedBack, response.data.status.message);
                } else {
                    Alert1.show(feedBack, loginString.somethingWentWrong);
                }
            });
        }).catch(error => {
            if (error) {
                this.isLoading = false;
                Alert1.show(feedBack, loginString.somethingWentWrong);
            }
        });


    }


    @action
    async submitFeedback(comments) {
        this.isLoading = true;
        this.feedbackRequestObject.comments = comments;
        await axios.post(URL.Save_GeneralFeedback, this.feedbackRequestObject, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => {
                this.isLoading = false;
                let data = response.data;
                if (data.status.code === 200) {
                    this.recentTrips = data.data;
                    this.clearSession();
                    Alert1.show(feedBack, data.status.message);
                    this.navigation.dispatch(StackActions.popToTop());
                } else if (data.status.message) {
                    Alert1.show(feedBack, data.status.message);
                } else {
                    Alert1.show(feedBack, loginString.somethingWentWrong);
                }
            });
        }).catch(error => {
            if (error) {
                this.isLoading = false;
                Alert1.show(feedBack, loginString.somethingWentWrong);
            }
        });
    }


    @action
    async reopenTicket(comments){
        this.isLoading = true;
        let body={
            Id:this.reOpenId,
            Comment:comments
        };
        await axios.post(URL.Re_Open_Ticket, body, {
            headers: this.getHeader()
        }).then(async response => {
            await runInAction(async () => {
                this.isLoading = false;
                let data = response.data;
                if (data.status.code === 200) {
                    this.recentTrips = data.data;
                    this.clearSession();
                    Alert1.show(feedBack, data.status.message);
                    this.navigation.dispatch(StackActions.popToTop());
                } else if (data.status.message) {
                    Alert1.show(feedBack, data.status.message);
                } else {
                    Alert1.show(feedBack, loginString.somethingWentWrong);
                }
            });
        }).catch(error => {
            if (error) {
                this.isLoading = false;
                Alert1.show(feedBack, loginString.somethingWentWrong);
            }
        });
    }


}

export default new FeedBackStore();
