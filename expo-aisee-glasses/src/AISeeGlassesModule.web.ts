import { registerWebModule, NativeModule } from 'expo';

// AISeeGlassesModule is not available on the web platform.
class AISeeGlassesModule extends NativeModule<{}> {}

export default registerWebModule(AISeeGlassesModule, 'AISeeGlassesModule');
