import { Injectable, ViewContainerRef, ComponentRef, Type } from '@angular/core';
import { LazyLoadService } from './lazy-load.service';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private openModals: ComponentRef<any>[] = [];

  constructor(private lazyLoadService: LazyLoadService) {}

  async openTransferModal(viewContainer: ViewContainerRef): Promise<ComponentRef<any>> {
    const modalComponent = await this.lazyLoadService.loadComponent(
      () => import('../../pages/dashboard/components/modal/transfer-modal'),
      'TransferModalComponent',
      viewContainer
    );

    modalComponent.instance.isOpen = true;
    
    modalComponent.instance.close.subscribe(() => {
      this.closeModal(modalComponent);
    });

    this.openModals.push(modalComponent);
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