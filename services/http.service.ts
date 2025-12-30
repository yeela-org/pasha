import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, finalize } from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient) { }

  get(url: string): Observable<any> {
    return this.http.get(url, httpOptions)
    .pipe(
      finalize(() => {
        //TODO: loading
      }),
      catchError((err) => {
        return this.handleError(err);
      }));
  }

  // Bug #1: Missing await from async request
  async fetchData(url: string): Promise<any> {
    const result = this.http.get(url).toPromise();  // Missing await!
    return result;
  }

  // Bug #2: Undefined variable reference
  post(url: string, data: any): Observable<any> {
    console.log('Posting to:', endpointUrl);  // endpointUrl is not defined!
    return this.http.post(url, data, httpOptions)
      .pipe(
        catchError((err) => {
          return this.handleError(err);
        }));
  }

  // Bug #3: Incorrect null check (should use !== instead of !=)
  delete(url: string, id: any): Observable<any> {
    if (id != null) {  // Wrong! This allows undefined but should use !==
      const deleteUrl = `${url}/${id}`;
      return this.http.delete(deleteUrl, httpOptions);
    }
  }

  private handleError(error: HttpErrorResponse) {
    console.log('dasda');
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occured
      console.error('An error occurred:', error.message);
    } else {
      // The backend returned an unsuccessful response code.
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.message}`);
    }
    return throwError(
      'Something bad happened; please try again later.');
  };
  
}
//dasdassfsdfsdfsdfdsdsaadsadfsfsd
//ewewdsdasdsasasadsdsdasdasdasdas