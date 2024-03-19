//
//  ParkZeusModule.swift
//  routematic
//
//  Created by UDHAYAKUMAR on 27/10/23.
//

import UIKit
import Foundation
import ParkZeus

@objc(ParkZeusModule)
class ParkZeusModule: NSObject {
  
//  static var viewController: PZViewController?
  
 @objc static func requiresMainQueueSetup() -> Bool { return true }
  
  @objc public func startParkZeus(_ emailId: String, userInfo: String, accessToken: String, refreshToken: String, endPoint: String) {
   print("email from routematic " + emailId);
   
//   DispatchQueue.main.async {
//     if let viewController = ParkZeusModule.viewController {
//       //               dispatch_async(dispatch_get_main_queue(), { () -> Void in
//       viewController.loadParkZeus(emailId: email)
//       //               })
//     }
//   }
//   , _ navController: UINavigationController
   DispatchQueue.main.async {
     print("in call pzview")
     let controller = PZController();
//     let controller = PZViewController();
//     controller.emailId = "udhay@routematic.com";
     if let navController = UIApplication.shared.keyWindow?.rootViewController as? UINavigationController {
       print("caling parking app");
       controller.loadParkZeus(on: navController, with: emailId, userInfo, accessToken, refreshToken, endPoint);
//       controller.loadParkZeus(on: navController, with: emailId, userInfo: "MDAwMTExNTk2NTpPRkZJQ0VCQVNFUDEwOmphajNoZ2E0NW95eGxyemQ3NGdvOXMzcGg2cDJ3M2Vy");
//       navController.pushViewController(controller, animated: true)
     } else {
       print("in else nav");
     }
     
//     let navController = UIApplication.shared.keyWindow?.rootViewController as? UINavigationController;
//     let navController = UIApplication.shared.keyWindow?.rootViewController as? UINavigationController;
//     print("navCountoller - ")
//     navController?.pushViewController(controller, animated: true)

//     UIApplication.shared.keyWindow?.rootViewController?.present(controller, animated: true, completion: nil)
     
//     let rvc = UIApplication.shared.keyWindow?.rootViewController
//     let nrvc = UIApplication.shared.windows.last?.rootViewController
     
//     let navController = UINavigationController(rootViewController: rvc)
     //       controller.loadParkZeus(on: navController);
     
     
     
//     if let navController = UIApplication.shared.keyWindow?.rootViewController as? UINavigationController {
////     if let navController = UIApplication.shared.windows.last?.rootViewController as? UINavigationController {
//       print("caling parking app");
//       navController.pushViewController(controller, animated: true)
//     } else {
//       print("in else nav");
//     }
   }
   
   
//   controller.loadParkZeus(on: navController ?? UINavigationController);
//   controller.loadParkZeus(on: self.navigationController ?? UINavigationController(), with: email)
 }
  
  @objc public func loadParkZeusControl() {
 //    let hello = HelloClass()
 //    hello.loadScreen()
  }
// @objc public func simpleMethodReturns(
//   _ callback: RCTResponseSenderBlock
// ) {
//   callback(["ParkZeusModule.simpleMethodReturns()"])
// }
//
// @objc public func simpleMethodWithParams(
//   _ param: String,
//   callback: RCTResponseSenderBlock
// ) {
//   callback(["ParkZeusModule.simpleMethodWithParams('\(param)')"])
// }
//
// @objc public func throwError() throws {
////    throw createError(message: "ParkZeusModule.throwError()")
// }

 @objc public func resolvePromise(
   _ resolve: RCTPromiseResolveBlock,
   rejecter reject: RCTPromiseRejectBlock
 ) -> Void {
   resolve("ParkZeusModule.resolvePromise()")
 }

 @objc public func rejectPromise(
   _ resolve: RCTPromiseResolveBlock,
   rejecter reject: RCTPromiseRejectBlock
 ) -> Void {
   reject("0", "ParkZeusModule.rejectPromise()", nil)
 }
}
