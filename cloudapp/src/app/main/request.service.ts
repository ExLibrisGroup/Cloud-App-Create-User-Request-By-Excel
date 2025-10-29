import { Injectable } from '@angular/core';
import { CloudAppRestService, HttpMethod, RestErrorResponse } from '@exlibris/exl-cloudapp-angular-lib';
import {  Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class RequestService {

  constructor(
    private restService: CloudAppRestService

  ) { }

  processRequest(request: any) : Observable<any>{

    let requestBoday = 
    {
      "request_type": "HOLD",
      "pickup_location_type": "LIBRARY",
    };
    Object.keys(request).forEach(function(key){
      console.log(key);
      console.log(key + ' - ' + request[key]);
        if(["target_destination","material_type","destination_location","call_number_type","item_policy"].includes(key)){
          requestBoday[key] = {};
          requestBoday[key]['value'] = request[key]
        }else if (key === 'user_id'){
          requestBoday['user_primary_id']=request['user_id'];
        }else if (key === 'item_pid'){
          requestBoday['item_id']=request['item_pid'];
        }else {
          requestBoday[key]=request[key];
        }
    });

    let url= request.item_pid ? `/users/${request.user_id}/requests?mms_id=${request.mms_id}&item_pid=${request.item_pid}` : `/users/${request.user_id}/requests?mms_id=${request.mms_id}`;
        return this.restService.call({
          url: url,
          method: HttpMethod.POST,
          requestBody: requestBoday
        }).pipe(
          catchError(e=>{
              throw(e);
            }
          ),
          catchError(e=>of(this.handleError(e, request)))
        )
      

  }
  private handleError(e: any, request: any) {
    const props =  ['user_id', 'mms_id', 'item_pid'].map(p=>request[p]).join(', ');
    if (e) {
      e.message = e.message + ` (${props})`;
      e.title = request.title;
      e.description = request.description;
      e.pickup_location_library = request.pickup_location_library;
      e.user_primary_id = request.user_id;
      e.mms_id = request.mms_id;
      e.item_id = request.item_pid;
    }
    return e;
  }

  
}

