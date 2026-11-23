import { inject, Pipe, PipeTransform } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';

// Shows the Arabic name when the site is in Arabic, otherwise the English one.
//
// Usage in a template:
//   {{ asset.categoryName | localName: asset.categoryNameAr }}
//   {{ item.name | localName: item.nameAr }}
//
// Why a separate pipe and not the 't' pipe?
// 't' looks a text up in the ar.ts dictionary. These names are DATA typed by an admin
// (a new category tomorrow is not in any dictionary), so the Arabic comes from the API
// (the ...NameAr fields) instead.
//
// Why pure: false? Same reason as 't': the inputs don't change when the LANGUAGE changes,
// so a pure pipe would keep showing the old language. The work is one if, so it is cheap.
@Pipe({ name: 'localName', pure: false })
export class LocalNamePipe implements PipeTransform {
  private language = inject(LanguageService);

  transform(english: string | null | undefined, arabic?: string | null): string {
    return this.language.pick(english, arabic);
  }
}

/*
   API row: { categoryName: "Vehicles", categoryNameAr: "المركبات" }
                         │
        English site ────┼──── Arabic site
              ▼                      ▼
          "Vehicles"             "المركبات"
                       (categoryNameAr null → "Vehicles" in both)
*/
