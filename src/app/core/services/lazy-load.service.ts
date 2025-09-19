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
    try {
      if (!viewContainer || (viewContainer as any)._view?.destroyed) {
        throw new Error('ViewContainer is destroyed');
      }

      const module = await loader();
      const component = module[componentName];

      if (!component) {
        throw new Error(`Component ${componentName} not found in module`);
      }

      try {
        return viewContainer.createComponent(component);
      } catch (createError) {
        if (createError instanceof Error && createError.message.includes('NG0205')) {
          throw new Error('Component loading failed - injector destroyed');
        }
        throw createError;
      }
    } catch (error) {
      if (error instanceof Error && (error.message.includes('NG0205') || error.message.includes('injector destroyed') || error.message.includes('ViewContainer is destroyed'))) {
        console.error('Error loading component:', error);
        throw new Error('Component loading failed - injector destroyed');
      }
      console.error('Error loading component:', error);
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
