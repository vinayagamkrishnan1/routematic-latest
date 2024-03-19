//
//  RCTParkZeusModule.m
//  routematic
//
//  Created by UDHAYAKUMAR on 06/10/23.
//

#import "UIKit/UIKit.h"
#import "RCTParkZeusModule.h"

//#import <ParkZeus/ParkZeus.h>

@implementation RCTParkZeusModule

// To export a module named RCTParkZeusModule
RCT_EXPORT_MODULE(ParkingModule);

//Added NativeModules
RCT_EXPORT_METHOD(startParkZeus:(NSString *)emailID) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [self invokeFramework:emailID ];
  });
}

//Invoking the ParkZeusFramework
- (void)invokeFramework:(NSString*)emailID
{
  NSLog(@"This is the email received from the RN : %@", emailID);
//  PZViewController *countroller = [PZViewController new];
//
//  UIViewController *rootViewController = [UIApplication sharedApplication].delegate.window.rootViewController;
//
//  [rootViewController presentViewController:countroller animated:YES completion:nil];
}
@end

