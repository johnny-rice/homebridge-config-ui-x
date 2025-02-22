import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'
import { TranslateModule } from '@ngx-translate/core'

import { SupportRoutingModule } from '@/app/modules/support/support-routing.module'
import { SupportComponent } from '@/app/modules/support/support.component'

@NgModule({
  imports: [
    CommonModule,
    SupportRoutingModule,
    NgbModule,
    ReactiveFormsModule,
    TranslateModule,
    SupportComponent,
  ],
})
export class SupportModule {}
