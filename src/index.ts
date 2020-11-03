// Material Components
import '@material/mwc-button';
import '@material/mwc-checkbox';
import '@material/mwc-circular-progress';
import '@material/mwc-formfield';
import '@material/mwc-icon';
import '@material/mwc-icon-button';
import '@material/mwc-icon-button-toggle';
import '@material/mwc-linear-progress';
import '@material/mwc-list';
import '@material/mwc-list/mwc-check-list-item';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-list/mwc-radio-list-item';
import '@material/mwc-menu';
import '@material/mwc-radio';
import '@material/mwc-slider';
import '@material/mwc-snackbar';
import '@material/mwc-switch';
import '@material/mwc-tab-bar';
import 'web-dialog';
import { Popover } from 'weightless';
// Weightless Components
import 'weightless/label';
import 'weightless/list-item';
import { AnimatedList } from './components/animated-list/animated-list';
import { DateField } from './components/date-field/date-field';
import { DeleteButton } from './components/delete-button/delete-button';
import { Details } from './components/details/details';
import { DropZone } from './components/dropzone/dropzone';
import { EditorWrapper } from './components/editor-wrapper/editor-wrapper';
import { EnrichedHTML } from './components/enriched-html/enriched-html';
import { EventList } from './components/event-list/event-list';
import { Field } from './components/field/field';
import { Form } from './components/form/form';
import { Group } from './components/group/group';
import { Header } from './components/header/header';
import { NotificationCoin } from './components/notification-coin/notification-coin';
import { PopoverSection } from './components/popover/popover-section';
import { Section } from './components/section/section';
import { SubmitButton } from './components/submit-button/submit-button';
import { TimeField } from './components/time-field/time-field';
import { ToolTip } from './components/tooltip/tooltip';
import { ValueStatus } from './components/value-status/value-status';
import { SlWindow } from './components/window/window';
import { EntityFormFooter } from './entities/components/form-layout/entity-form-footer';
import { EntityFormHeader } from './entities/components/form-layout/entity-form-header';
import { EntityFormLayout } from './entities/components/form-layout/entity-form-layout';
import { InfomorphForm } from './entities/components/sleeve-forms/infomorph/infomorph-form';
import './init';

// Generic Components
Field;
Form;
AnimatedList;
DateField;
DeleteButton;
Details;
DropZone;
EditorWrapper;
EnrichedHTML;
Group;
EventList;
NotificationCoin;
Popover;
Header;
PopoverSection;
Section;
SubmitButton;
TimeField;
ToolTip;
ValueStatus;
SlWindow;

// Entity Form Components
EntityFormHeader;
EntityFormLayout;
EntityFormFooter;
InfomorphForm;

for (const link of [
  'https://fonts.googleapis.com/css?family=Material+Icons&display=block',
  'https://fonts.googleapis.com/css?family=Roboto:300,400,500',
  'https://fonts.googleapis.com/css?family=Rubik:300,400,700&display=swap',
  'https://fonts.googleapis.com/css?family=Jost:300,400,700&display=swap',
  'https://fonts.googleapis.com/css?family=Spartan:300,400,700&display=swap',
  'https://fonts.googleapis.com/css?family=Fira+Code&display=swap',
]) {
  const fontEl = document.createElement('link');
  fontEl.rel = 'stylesheet';
  fontEl.href = link;
  document.head.appendChild(fontEl);
}
