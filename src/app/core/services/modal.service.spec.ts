import { TestBed } from '@angular/core/testing';
import { ViewContainerRef, ComponentRef } from '@angular/core';
import { of } from 'rxjs';
import { ModalService } from './modal.service';
import { LazyLoadService } from './lazy-load.service';

describe('ModalService', () => {
  let service: ModalService;
  let mockLazyLoadService: jasmine.SpyObj<LazyLoadService>;
  let mockViewContainer: jasmine.SpyObj<ViewContainerRef>;
  let mockComponentRef: jasmine.SpyObj<ComponentRef<any>>;

  beforeEach(() => {
    mockComponentRef = jasmine.createSpyObj('ComponentRef', ['destroy'], {
      instance: {
        isOpen: false,
        close: of(void 0),
      },
    });

    mockLazyLoadService = jasmine.createSpyObj('LazyLoadService', ['loadComponent']);
    mockLazyLoadService.loadComponent.and.returnValue(Promise.resolve(mockComponentRef));

    mockViewContainer = jasmine.createSpyObj('ViewContainerRef', ['createComponent']);

    TestBed.configureTestingModule({
      providers: [{ provide: LazyLoadService, useValue: mockLazyLoadService }],
    });
    service = TestBed.inject(ModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should open transfer modal successfully', async () => {
    const result = await service.openTransferModal(mockViewContainer);

    expect(mockLazyLoadService.loadComponent).toHaveBeenCalledWith(
      jasmine.any(Function),
      'TransferModalComponent',
      mockViewContainer
    );
    expect(result.instance.isOpen).toBe(true);
    expect(result).toBe(mockComponentRef);
  });

  it('should open deposit modal successfully', async () => {
    const result = await service.openDepositModal(mockViewContainer);

    expect(mockLazyLoadService.loadComponent).toHaveBeenCalledWith(
      jasmine.any(Function),
      'DepositModalComponent',
      mockViewContainer
    );
    expect(result.instance.isOpen).toBe(true);
    expect(result).toBe(mockComponentRef);
  });

  it('should track opened modals', async () => {
    const modal1 = await service.openTransferModal(mockViewContainer);
    const modal2 = await service.openDepositModal(mockViewContainer);

    // Verify both modals are tracked (checking via closeAllModals behavior)
    service.closeAllModals();

    expect(modal1.destroy).toHaveBeenCalled();
    expect(modal2.destroy).toHaveBeenCalled();
  });

  it('should close modal when close event is emitted', async () => {
    const closeSubject = { subscribe: jasmine.createSpy('subscribe') };
    mockComponentRef.instance.close = closeSubject;

    await service.openTransferModal(mockViewContainer);

    expect(closeSubject.subscribe).toHaveBeenCalled();

    const closeCallback = closeSubject.subscribe.calls.mostRecent().args[0];
    closeCallback();

    expect(mockComponentRef.destroy).toHaveBeenCalled();
  });

  it('should remove modal from tracking when closed', async () => {
    const closeSubject = { subscribe: jasmine.createSpy('subscribe') };
    mockComponentRef.instance.close = closeSubject;

    await service.openTransferModal(mockViewContainer);

    const closeCallback = closeSubject.subscribe.calls.mostRecent().args[0];
    closeCallback();

    mockComponentRef.destroy.calls.reset();
    await service.openDepositModal(mockViewContainer);
    service.closeAllModals();

    expect(mockComponentRef.destroy).toHaveBeenCalledTimes(1);
  });

  it('should close all modals', async () => {
    const modal1 = await service.openTransferModal(mockViewContainer);
    const modal2 = await service.openDepositModal(mockViewContainer);

    service.closeAllModals();

    expect(modal1.destroy).toHaveBeenCalled();
    expect(modal2.destroy).toHaveBeenCalled();
  });

  it('should clear modal tracking after closing all', async () => {
    await service.openTransferModal(mockViewContainer);
    await service.openDepositModal(mockViewContainer);

    service.closeAllModals();
    mockComponentRef.destroy.calls.reset();

    service.closeAllModals();
    expect(mockComponentRef.destroy).not.toHaveBeenCalled();
  });

  it('should handle close modal for non-existent modal gracefully', async () => {
    const modal = await service.openTransferModal(mockViewContainer);

    (service as any).openModals = [];

    expect(() => {
      (service as any).closeModal(modal);
    }).not.toThrow();
  });
});
