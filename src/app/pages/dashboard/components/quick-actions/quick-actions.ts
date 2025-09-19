import { Component, ViewChild, ViewContainerRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroArrowDownTraySolid, heroArrowRightCircleSolid } from '@ng-icons/heroicons/solid';
import { QuickActionsCards } from '../quick-actions-cards/quick-actions-cards';
import { ModalService } from '../../../../core/services/modal.service';

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
}

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule, NgIconComponent, QuickActionsCards],
  providers: [
    provideIcons({
      heroArrowDownTraySolid,
      heroArrowRightCircleSolid,
    }),
  ],
  templateUrl: './quick-actions.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickActions {
  @ViewChild('modalContainer', { read: ViewContainerRef, static: true })
  modalContainer!: ViewContainerRef;

  quickActions: QuickAction[] = [
    {
      id: 'deposit',
      title: 'Deposit',
      description: 'Add funds to your wallet',
      icon: 'heroArrowDownTraySolid',
      action: () => this.handleDeposit(),
    },
    {
      id: 'transfer',
      title: 'Transfer',
      description: 'Send money to others',
      icon: 'heroArrowRightCircleSolid',
      action: () => this.handleTransfer(),
    },
  ];

  constructor(private modalService: ModalService) {}

  async handleDeposit() {
    try {
      if (!this.modalService) {
        console.error('Modal service is not available');
        return;
      }
      await this.modalService.openDepositModal(this.modalContainer);
    } catch (error) {
      console.error('Error opening deposit modal:', error);
    }
  }

  async handleTransfer() {
    try {
      if (!this.modalService) {
        console.error('Modal service is not available');
        return;
      }
      await this.modalService.openTransferModal(this.modalContainer);
    } catch (error) {
      console.error('Error opening transfer modal:', error);
    }
  }
}
