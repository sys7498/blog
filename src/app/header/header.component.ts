import {
  Component,
  Input,
  QueryList,
  SimpleChanges,
  ViewChildren,
} from '@angular/core';
import { TextButtonComponent } from '../component/text-button/text-button.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  @ViewChildren('headerButtons') headerButtons: QueryList<TextButtonComponent> =
    undefined as unknown as QueryList<TextButtonComponent>;

  public readonly pages: { [key: string]: boolean } = {
    '/': true,
    '/post': false,
    '/about': false,
    '/project': false,
  };

  @Input() public currentPath: string = '';
  constructor(private _router: Router) {}

  public ngOnInit() {}
  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentPath']) {
      this.changePage(this.currentPath);
    }
  }

  public changePage(path: string) {
    //let page = path.slice(1);
    let page = path;
    for (let key of this.pageKeys) {
      this.pages[key] = false;
    }
    this.pages[page] = true;
  }

  public onClickPageButton(page: string) {
    this._router.navigate([page]);
  }

  get pageKeys(): string[] {
    return Object.keys(this.pages);
  }

  get pageEntries(): [string, boolean][] {
    return Object.entries(this.pages);
  }
}
