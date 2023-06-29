import { SetMetadata } from '@nestjs/common';
import { Constants } from '../Constants';

export const TraceIgnore = () =>
  SetMetadata(Constants.TRACE_METADATA_IGNORE, true);
