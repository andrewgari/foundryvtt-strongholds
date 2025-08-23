export type SvelteCtor<TProps = Record<string, unknown>> = new (opts: {
  target: Element;
  props?: TProps;
}) => unknown;

export interface SvelteAppOptions<TProps = Record<string, unknown>> extends Application.Options {
  id?: string;
  title?: string;
  svelte: SvelteCtor<TProps>;
}

export class SvelteApplication<TOptions extends SvelteAppOptions = SvelteAppOptions> extends Application<TOptions> {
  component: unknown | null = null;

  static override get defaultOptions(): Application.Options {
    const base = super.defaultOptions;
    return {
      ...base,
      template: 'modules/strongholds/templates/svelte-app.html',
      popOut: true,
      width: 600,
      height: 400
    } as Application.Options;
  }

  override render(force?: boolean, options?: Application.RenderOptions) {
    const result = super.render(force, options);
    const mount = document.getElementById(this.options.id!);
    const Comp = (this.options as SvelteAppOptions).svelte;
    if (mount && !this.component && Comp) {
      this.component = new Comp({ target: mount });
    }
    return result;
  }
}

