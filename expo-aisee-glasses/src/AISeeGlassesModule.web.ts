import { NativeModule } from 'expo';

// AISeeGlassesModule is not available on the web platform.
class AISeeGlassesModule extends NativeModule<{}> {}

export default new AISeeGlassesModule();
