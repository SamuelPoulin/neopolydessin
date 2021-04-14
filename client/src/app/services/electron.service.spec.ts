export const MockElectronService = jasmine.createSpyObj('MockElectronService', {
  random: [],
});

MockElectronService.isElectronApp = false;
