import { observable, computed } from 'mobx';
import * as React from 'react';
import { ipcRenderer } from 'electron';
import store from '.';

let lastSuggestion: string;

const autoComplete = (text: string, suggestion: string) => {
  const regex = /(http(s?)):\/\/(www.)?|www./gi;
  const regex2 = /(http(s?)):\/\//gi;

  const start = text.length;

  const input = store.overlay.inputRef.current;

  if (input.selectionStart !== input.value.length) return;

  if (suggestion) {
    if (suggestion.startsWith(text.replace(regex, ''))) {
      input.value = text + suggestion.replace(text.replace(regex, ''), '');
    } else if (`www.${suggestion}`.startsWith(text.replace(regex2, ''))) {
      input.value =
        text + `www.${suggestion}`.replace(text.replace(regex2, ''), '');
    }
    input.setSelectionRange(start, input.value.length);
  }
};

export type OverlayContent = 'default' | 'history' | 'bookmarks' | 'settings';

export class OverlayStore {
  public scrollRef = React.createRef<HTMLDivElement>();
  public inputRef = React.createRef<HTMLInputElement>();

  public canSuggest = false;

  @observable
  private _visible = true;

  @observable
  public isNewTab = true;

  @observable
  public currentContent: OverlayContent = 'default';

  @observable
  public dialTypeMenuVisible = false;

  @observable
  public _searchBoxValue = '';

  private timeout: any;

  @computed
  public get searchBoxValue() {
    return this._searchBoxValue;
  }

  public set searchBoxValue(val: string) {
    this._searchBoxValue = val;
    this.inputRef.current.value = val;
  }

  public constructor() {
    window.addEventListener('keydown', this.onWindowKeyDown);
  }

  public onWindowKeyDown = (e: KeyboardEvent) => {
    if (!this._visible || e.keyCode !== 27) return; // Escape

    if (this.currentContent !== 'default') {
      this.currentContent = 'default';
    } else if (!this.isNewTab) {
      this.visible = false;
    }
  };

  @computed
  public get isBookmarked() {
    if (!store.tabs.selectedTab) return false;
    return this.bookmark != null;
  }

  @computed
  public get bookmark() {
    return store.bookmarks.list.find(x => x.url === store.tabs.selectedTab.url);
  }

  public async show() {
    clearTimeout(this.timeout);

    if (this.scrollRef.current) {
      this.scrollRef.current.scrollTop = 0;
    }

    ipcRenderer.send(`permission-dialog-hide-${store.windowId}`);
    ipcRenderer.send(`browserview-hide-${store.windowId}`);

    this._visible = true;
  }

  @computed
  public get visible() {
    return this._visible;
  }

  public set visible(val: boolean) {
    this.currentContent = 'default';

    if (!val) {
      clearTimeout(this.timeout);

      this.timeout = setTimeout(
        () => {
          if (store.tabs.selectedTab) {
            if (store.tabs.selectedTab.isWindow) {
              store.tabs.selectedTab.select();
            } else ipcRenderer.send(`browserview-show-${store.windowId}`);
          }
        },
        store.settings.object.animations ? 200 : 0,
      );

      store.suggestions.list = [];
      lastSuggestion = undefined;

      this.inputRef.current.value = '';

      this._visible = val;
      this.isNewTab = false;
    } else {
      this.show();
      ipcRenderer.send(`window-focus-${store.windowId}`);

      const { selectedTab } = store.tabs;

      if (selectedTab) {
        selectedTab.findInfo.visible = false;

        ipcRenderer.send(
          `update-find-info-${store.windowId}`,
          selectedTab.id,
          selectedTab.findInfo,
        );
      }

      if (!this.isNewTab) {
        selectedTab
          .callViewMethod('webContents.getURL')
          .then(async (url: string) => {
            this.searchBoxValue = url;
            this.inputRef.current.focus();
            this.inputRef.current.select();
          });
      } else {
        this.inputRef.current.value = '';

        setTimeout(() => {
          this.inputRef.current.focus();
          this.inputRef.current.select();
        });
      }

      this._visible = val;
    }
  }

  public suggest() {
    const { suggestions } = store;
    const input = this.inputRef.current;

    if (this.canSuggest) {
      autoComplete(input.value, lastSuggestion);
    }

    suggestions.load(input).then(suggestion => {
      lastSuggestion = suggestion;
      if (this.canSuggest) {
        autoComplete(
          input.value.substring(0, input.selectionStart),
          suggestion,
        );
        this.canSuggest = false;
      }
    });

    suggestions.selected = 0;
  }
}
