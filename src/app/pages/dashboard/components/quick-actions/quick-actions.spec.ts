import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewContainerRef, ComponentRef } from '@angular/core';
import { QuickActions, QuickAction } from './quick-actions';
import { ModalService } from '../../../../core/services/modal.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroArrowDownTraySolid, heroArrowRightCircleSolid } from '@ng-icons/heroicons/solid';

describe('QuickActions', () => {
  let component: QuickActions;
  let fixture: ComponentFixture<QuickActions>;
  let modalService: jasmine.SpyObj<ModalService>;
  let mockModalContainer: jasmine.SpyObj<ViewContainerRef>;

  function createMockComponentRef(instanceData: any): Partial<ComponentRef<any>> {
    return {
      instance: instanceData,
      location: {} as any,
      injector: {} as any,
      hostView: {} as any,
      componentType: {} as any,
      changeDetectorRef: {} as any,
      onDestroy: jasmine.createSpy('onDestroy'),
      destroy: jasmine.createSpy('destroy'),
      setInput: jasmine.createSpy('setInput'),
    };
  }

  beforeEach(async () => {
    const modalSpy = jasmine.createSpyObj('ModalService', [
      'openDepositModal',
      'openTransferModal',
    ]);

    await TestBed.configureTestingModule({
      imports: [QuickActions, NgIconComponent],
      providers: [
        { provide: ModalService, useValue: modalSpy },
        provideIcons({
          heroArrowDownTraySolid,
          heroArrowRightCircleSolid,
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuickActions);
    component = fixture.componentInstance;
    modalService = TestBed.inject(ModalService) as jasmine.SpyObj<ModalService>;

    mockModalContainer = jasmine.createSpyObj('ViewContainerRef', ['clear']);
    component.modalContainer = mockModalContainer;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default quick actions', () => {
    expect(component.quickActions).toBeDefined();
    expect(component.quickActions.length).toBe(2);

    const depositAction = component.quickActions.find((action) => action.id === 'deposit');
    const transferAction = component.quickActions.find((action) => action.id === 'transfer');

    expect(depositAction).toBeDefined();
    expect(depositAction?.title).toBe('Deposit');
    expect(depositAction?.description).toBe('Add funds to your wallet');
    expect(depositAction?.icon).toBe('heroArrowDownTraySolid');

    expect(transferAction).toBeDefined();
    expect(transferAction?.title).toBe('Transfer');
    expect(transferAction?.description).toBe('Send money to others');
    expect(transferAction?.icon).toBe('heroArrowRightCircleSolid');
  });

  describe('handleDeposit', () => {
    it('should call modalService.openDepositModal successfully', async () => {
      const mockModalRef = createMockComponentRef({ isOpen: true });
      modalService.openDepositModal.and.returnValue(
        Promise.resolve(mockModalRef as ComponentRef<any>)
      );

      await component.handleDeposit();

      expect(modalService.openDepositModal).toHaveBeenCalledWith(mockModalContainer);
    });

    it('should handle deposit modal opening errors', async () => {
      const error = new Error('Failed to open deposit modal');
      modalService.openDepositModal.and.returnValue(Promise.reject(error));
      spyOn(console, 'error');

      await component.handleDeposit();

      expect(console.error).toHaveBeenCalledWith('Error opening deposit modal:', error);
    });

    it('should be callable through quickActions array', async () => {
      spyOn(component, 'handleDeposit');
      const depositAction = component.quickActions.find((action) => action.id === 'deposit');

      depositAction?.action();

      expect(component.handleDeposit).toHaveBeenCalled();
    });
  });

  describe('handleTransfer', () => {
    it('should call modalService.openTransferModal successfully', async () => {
      const mockModalRef = createMockComponentRef({ isOpen: true });
      modalService.openTransferModal.and.returnValue(
        Promise.resolve(mockModalRef as ComponentRef<any>)
      );

      await component.handleTransfer();

      expect(modalService.openTransferModal).toHaveBeenCalledWith(mockModalContainer);
    });

    it('should handle transfer modal opening errors', async () => {
      const error = new Error('Failed to open transfer modal');
      modalService.openTransferModal.and.returnValue(Promise.reject(error));
      spyOn(console, 'error');

      await component.handleTransfer();

      expect(console.error).toHaveBeenCalledWith('Error opening transfer modal:', error);
    });

    it('should be callable through quickActions array', async () => {
      spyOn(component, 'handleTransfer');
      const transferAction = component.quickActions.find((action) => action.id === 'transfer');

      transferAction?.action();

      expect(component.handleTransfer).toHaveBeenCalled();
    });
  });

  describe('QuickAction interface validation', () => {
    it('should validate QuickAction structure', () => {
      component.quickActions.forEach((action: QuickAction) => {
        expect(action.id).toBeDefined();
        expect(typeof action.id).toBe('string');
        expect(action.title).toBeDefined();
        expect(typeof action.title).toBe('string');
        expect(action.description).toBeDefined();
        expect(typeof action.description).toBe('string');
        expect(action.icon).toBeDefined();
        expect(typeof action.icon).toBe('string');
        expect(action.action).toBeDefined();
        expect(typeof action.action).toBe('function');
      });
    });

    it('should have unique ids for all actions', () => {
      const ids = component.quickActions.map((action) => action.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids.length).toBe(uniqueIds.length);
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle modalService being undefined gracefully', async () => {
      (component as any).modalService = null;
      spyOn(console, 'error');

      await component.handleDeposit();

      expect(console.error).toHaveBeenCalled();
    });

    it('should handle modalContainer being undefined', async () => {
      component.modalContainer = undefined as any;
      const mockModalRef = createMockComponentRef({ isOpen: true });
      modalService.openDepositModal.and.returnValue(
        Promise.resolve(mockModalRef as ComponentRef<any>)
      );

      await component.handleDeposit();

      expect(modalService.openDepositModal).toHaveBeenCalledWith(undefined as any);
    });

    it('should handle multiple rapid action calls', async () => {
      const mockModalRef1 = createMockComponentRef({ isOpen: true });
      const mockModalRef2 = createMockComponentRef({ isOpen: true });
      modalService.openDepositModal.and.returnValue(
        Promise.resolve(mockModalRef1 as ComponentRef<any>)
      );
      modalService.openTransferModal.and.returnValue(
        Promise.resolve(mockModalRef2 as ComponentRef<any>)
      );

      const promises = [
        component.handleDeposit(),
        component.handleTransfer(),
        component.handleDeposit(),
      ];

      await Promise.all(promises);

      expect(modalService.openDepositModal).toHaveBeenCalledTimes(2);
      expect(modalService.openTransferModal).toHaveBeenCalledTimes(1);
    });

    it('should handle async operations correctly', async () => {
      let resolvePromise: Function;
      const modalPromise = new Promise<ComponentRef<any>>((resolve) => {
        resolvePromise = resolve;
      });

      modalService.openDepositModal.and.returnValue(modalPromise);

      const handlePromise = component.handleDeposit();
      expect(modalService.openDepositModal).toHaveBeenCalled();

      const mockModalRef = createMockComponentRef({ isOpen: true });
      resolvePromise!(mockModalRef as ComponentRef<any>);
      await handlePromise;

      expect(true).toBe(true);
    });
  });

  describe('component integration', () => {
    it('should render without ViewContainerRef initially', () => {
      const newFixture = TestBed.createComponent(QuickActions);
      const newComponent = newFixture.componentInstance;

      expect(newComponent).toBeTruthy();
      expect(newComponent.quickActions).toBeDefined();
    });

    it('should maintain action functionality after component init', () => {
      fixture.detectChanges();

      const depositAction = component.quickActions.find((action) => action.id === 'deposit');
      const transferAction = component.quickActions.find((action) => action.id === 'transfer');

      expect(depositAction?.action).toBeDefined();
      expect(transferAction?.action).toBeDefined();
      expect(typeof depositAction?.action).toBe('function');
      expect(typeof transferAction?.action).toBe('function');
    });
  });
});
