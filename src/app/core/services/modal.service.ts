import { Injectable, ViewContainerRef, ComponentRef, Type } from '@angular/core';
import { LazyLoadService } from './lazy-load.service';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private openModals: ComponentRef<any>[] = [];

  constructor(private lazyLoadService: LazyLoadService) {}

  async openTransferModal(viewContainer: ViewContainerRef): Promise<ComponentRef<any>> {
    console.log('Opening transfer modal...');
    const modalComponent = await this.lazyLoadService.loadComponent(
      () => import('../../pages/dashboard/components/modal/transfer-modal'),
      'TransferModalComponent',
      viewContainer
    );

    console.log('Transfer modal component created, setting isOpen to true');
    modalComponent.instance.isOpen = true;
    console.log('isOpen set to:', modalComponent.instance.isOpen);
    
    modalComponent.instance.close.subscribe(() => {
      this.closeModal(modalComponent);
    });

    this.openModals.push(modalComponent);
    console.log('Transfer modal should now be visible');
    return modalComponent;
  }

  async openDepositModal(viewContainer: ViewContainerRef): Promise<ComponentRef<any>> {
    const modalComponent = await this.lazyLoadService.loadComponent(
      () => import('../../pages/dashboard/components/modal/deposit-modal'),
      'DepositModalComponent',
      viewContainer
    );

    modalComponent.instance.isOpen = true;
    
    modalComponent.instance.close.subscribe(() => {
      this.closeModal(modalComponent);
    });

    this.openModals.push(modalComponent);
    return modalComponent;
  }

  async openSwapModal(viewContainer: ViewContainerRef): Promise<ComponentRef<any>> {
    const modalComponent = await this.lazyLoadService.loadComponent(
      () => import('../../pages/dashboard/components/modal/swap-modal'),
      'SwapModalComponent',
      viewContainer
    );

    modalComponent.instance.isOpen = true;
    
    modalComponent.instance.close.subscribe(() => {
      this.closeModal(modalComponent);
    });

    this.openModals.push(modalComponent);
    return modalComponent;
  }

  private closeModal(modalRef: ComponentRef<any>) {
    const index = this.openModals.indexOf(modalRef);
    if (index !== -1) {
      this.openModals.splice(index, 1);
      modalRef.destroy();
    }
  }

  closeAllModals() {
    this.openModals.forEach(modal => {
      modal.destroy();
    });
    this.openModals = [];
  }
}