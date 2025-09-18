import { Injectable, ViewContainerRef, ComponentRef, Type } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LazyLoadService {
  async loadComponent<T>(
    loader: () => Promise<{ [key: string]: Type<T> }>,
    componentName: string,
    viewContainer: ViewContainerRef
  ): Promise<ComponentRef<T>> {
    const module = await loader();
    const component = module[componentName];

    if (!component) {
      throw new Error(`Component ${componentName} not found in module`);
    }

    try {
      return viewContainer.createComponent(component);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Injector has already been destroyed')) {
        throw error;
      }
      throw error;
    }
  }

  async loadModalComponent<T>(
    loader: () => Promise<{ [key: string]: Type<T> }>,
    componentName: string
  ): Promise<Type<T>> {
    const module = await loader();
    const component = module[componentName];

    if (!component) {
      throw new Error(`Component ${componentName} not found in module`);
    }

    return component;
  }
}
