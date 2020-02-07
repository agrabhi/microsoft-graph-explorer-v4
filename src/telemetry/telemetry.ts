import { ReactPlugin, withAITracking } from '@microsoft/applicationinsights-react-js';
import { ApplicationAnalytics, ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ComponentType } from 'react';
import ITelemetry from './ITelemetry';

class Telemetry implements ITelemetry {
  private appInsights: ApplicationInsights;
  private config: any;

  constructor() {
    const areWeInDev = process.env.NODE_ENV === 'development';

    this.config = {
      instrumentationKey: process.env.REACT_APP_INSTRUMENTATION_KEY,
      disableExceptionTracking: true,
      disableTelemetry: areWeInDev ? false : true,
    };

    this.appInsights = new ApplicationInsights({
      config: this.config
    });
  }

  public initialize() {
    this.appInsights.loadAppInsights();

    this.appInsights.trackPageView();
  }

  public trackEvent(eventName: string, payload: any) {
    if (!this.valid(eventName)) {
      throw new Error('Invalid telemetry event name');
    }

    this.appInsights.trackEvent({ name: eventName }, payload);
  }

  public trackException(error: Error) {
    const exception: any = { error: error.stack };
    this.appInsights.trackException(exception);
  }

  public trackReactComponent(ComponentToTrack: ComponentType): ComponentType {
    const reactPlugin = new ReactPlugin();
    const appInsightsAnalytics = new ApplicationAnalytics();
    appInsightsAnalytics.initialize(this.config, this.appInsights.core, []);
    reactPlugin.initialize(this.config, this.appInsights.core, [appInsightsAnalytics]);

    return withAITracking(reactPlugin, ComponentToTrack);
  }

  // A valid event name ends with the word EVENT
  private valid(eventName: string): boolean {
    const listOfWords = eventName.split('_');
    const lastIndex = listOfWords.length - 1;
    const lastWord = listOfWords[lastIndex];
    return lastWord === 'EVENT';
  }
}

export const telemetry = new Telemetry();