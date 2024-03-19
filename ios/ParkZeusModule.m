//
//  ParkZeusModule.m
//  routematic
//
//  Created by UDHAYAKUMAR on 27/10/23.
//

#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(ParkZeusModule, NSObject)

RCT_EXTERN_METHOD(startParkZeus: (NSString *) email)
//{
//    NSLog(@"RN binding - Native View - Loading MyViewController.swift");
//    AppDelegate *appDelegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
//    [appDelegate goToNativeView];
//})
  RCT_EXTERN_METHOD(loadParkZeusControl)
//  RCT_EXTERN_METHOD(simpleMethodReturns:
//    (RCTResponseSenderBlock) callback
//  )
//  RCT_EXTERN_METHOD(simpleMethodWithParams:
//    (NSString *) param
//    callback: (RCTResponseSenderBlock)callback
//  )
  RCT_EXTERN_METHOD(
    resolvePromise: (RCTPromiseResolveBlock) resolve
    rejecter: (RCTPromiseRejectBlock) reject
  )
  RCT_EXTERN_METHOD(rejectPromise:
    (RCTPromiseResolveBlock) resolve
    rejecter: (RCTPromiseRejectBlock) reject
  )
@end
