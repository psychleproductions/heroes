import { Injectable } from '@angular/core';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Hero } from './hero';
import { MessageService } from './message.service';

const httpOptions = {
	headers: new HttpHeaders({
		'Content-Type': 'application/json'
	})
};

@Injectable({
  providedIn: 'root'
})
export class HeroService {

	private heroesUrl = 'api/heroes';

	constructor(
		private http: HttpClient,
		private messageService: MessageService) { }

	private log(message: string) {
		this.messageService.add(`Hero service: ${message}`)
	}

	private handleError<T>(operation = 'operation', result? : T) {
		return (error: any): Observable<T> => {
			console.error(error);
			this.log(`${operation} failed: ${error.message}`);
			return of(result as T);
		};
	}	

	getHeroes(): Observable<Hero[]> {

		return this.http.get<Hero[]>(this.heroesUrl).pipe(
			tap(_ => this.log('fetched heroes...')),
			catchError(this.handleError<Hero[]>('getHeroes', []))
		);
	}

	/** GET hero by id. Will 404 if id not found */
	getHero(id: number): Observable<Hero> {
		const url = `${this.heroesUrl}/${id}`;
		return this.http.get<Hero>(url).pipe(
			tap(_ => this.log(`fetched hero id=${id}`)),
			catchError(this.handleError<Hero>(`getHero id=${id}`))
		);
	}

	updateHero(hero: Hero): Observable<any> {
		return this.http.put(this.heroesUrl, hero, httpOptions).pipe(
			tap(_ => this.log(`updated hero id=${hero.id}`)),
			catchError(this.handleError<any>('update hero'))
		);
	}

	addHero(hero: Hero): Observable<Hero> {
		return this.http.post(this.heroesUrl, hero, httpOptions).pipe(
			tap((newHero: Hero) => this.log(`added hero w/id=${newHero.id}`)),
			catchError(this.handleError<Hero>('add hero'))
		);
	}
	
	deleteHero(hero: Hero | number): Observable<Hero> {
		const id = typeof hero === 'number' ? hero : hero.id;
		const url = `${this.heroesUrl}/${id}`;
		return this.http.delete<Hero>(url, httpOptions).pipe(
			tap(_ => this.log(`deleted hero id=${id}`)),
			catchError(this.handleError<Hero>('delete hero'))
		);
	}

	searchHeroes(term: string): Observable<Hero[]> {
		if (!term.trim) {
			return of([]);
		}

		return this.http.get<Hero[]>(`${this.heroesUrl}/?name=${term}`).pipe(
			tap(_ => this.log(`found heroes matching ${term}`)),
			catchError(this.handleError<Hero[]>('search heroes', []))
		);
	}
}
