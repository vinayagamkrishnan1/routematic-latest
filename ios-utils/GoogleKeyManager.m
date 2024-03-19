//
//  GoogleKeyManager.m
//  Routematic
//
//  Created by Soumya Ranjan Sethy on 22/03/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "GoogleKeyManager.h"
#import <React/RCTLog.h>

@implementation GoogleKeyManager

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(addEvent:(NSString *)keyType location:(NSString *)key)
{
  //RCTLogInfo(@"Google Map %@ --> %@", keyType, key);
  // Add an observer that will respond to loginComplete
  NSDictionary* googleKeys = @{@"placesAPI": key};
  // Post a notification to Google Map Key
  [[NSNotificationCenter defaultCenter] postNotificationName:@"googleMapPlacesKey" object:self userInfo:googleKeys];
  
  
}

@end

